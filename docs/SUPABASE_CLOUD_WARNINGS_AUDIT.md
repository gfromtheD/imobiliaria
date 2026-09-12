# Auditoría de warnings — Supabase Cloud

Fecha: 2026-09-12. Fuente: Security Advisor y Performance Advisor de la
instancia Cloud, más inspección de permisos, RLS, Storage, Auth y funciones.

## Resultado

El Dashboard mostraba 54 warnings de seguridad. El inventario completo era de
66 lints: 55 `WARN` y 11 `INFO`. La mayor parte no eran 54 problemas
independientes: 52 avisos procedían de los permisos de 26 funciones `SECURITY
DEFINER`.

Se aplicaron dos migraciones nuevas y reversibles:

- `20260912010000_security_advisor_hardening.sql`: elimina el grant `PUBLIC`
  y hace que la policy `users: update self` evalúe `auth.uid()` una vez por
  consulta, sin cambiar su predicado.
- `20260912020000_function_execute_least_privilege.sql`: elimina los grants
  explícitos de `anon` y `authenticated`, restituye únicamente los 14 RPCs de
  producto para usuarios autenticados y deja worker, scheduler, triggers y
  Stripe disponibles solo para `service_role`.

La segunda migración es necesaria porque Supabase había creado grants
explícitos para `anon` y `authenticated`; revocar solamente `PUBLIC` no los
elimina.

## Inventario final

| Causa | Cantidad | Prioridad | Decisión |
| --- | ---: | --- | --- |
| SECURITY DEFINER ejecutable por `authenticated` | 14 | MEDIA | Se conserva: son los RPCs autenticados de producto y validan pertenencia. Revisar en cada RPC nuevo. |
| Protección contra contraseñas filtradas desactivada | 1 | ALTA | Propuesta: habilitarla en Auth Dashboard tras revisar impacto de registro. No se cambia automáticamente. |
| `pg_net` en `public` | 1 | MEDIA | Se conserva: el scheduler usa `pg_net`; mover la extensión exige plan de compatibilidad. |
| RLS habilitado sin policies | 5 | INFORMATIVA | Intencional para tablas solo backend (`app_config`, `image_jobs`, `phase0_config`, `room_deletion_requests`, `stripe_events`): RLS sin policy deniega acceso. |
| Claves foráneas sin índice | 3 | BAJA | Propuesta: medir carga y crear índices solo si los patrones de consulta lo justifican. |
| Índices sin uso observado | 3 | INFORMATIVA | No borrar: en una Alpha con poco tráfico la métrica no prueba que sobren. |

Las tres FK señaladas son `generations.style_id`,
`room_deletion_requests.organization_id` y `usage_ledger.generation_id`. Los
índices con cero uso observado son `idx_properties_organization`,
`idx_subscriptions_stripe_customer` e `idx_subscriptions_stripe_subscription`.

## Evidencia posterior

- Advisors: 66 lints iniciales → 27 finales; 55 `WARN` → 16 `WARN`.
- Ninguna función `SECURITY DEFINER` es ejecutable por `anon`.
- 12 funciones internas ya no son ejecutables por `authenticated`; las 14
  restantes corresponden al flujo autenticado de producto.
- Cloud E2E: 15/15 PASS. RoomImages Cloud E2E: 19/19 PASS, incluido aislamiento
  entre organizaciones y worker Cloud.
- Typecheck y lint: PASS.
- Storage permanece privado (`original-images`, `staged-images`), y ambas Edge
  Functions activas mantienen verificación JWT.
