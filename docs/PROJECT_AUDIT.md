# PROJECT_AUDIT.md

Auditoría del proyecto y revisión posterior a las decisiones aprobadas.

Fecha: 2026-08-15

Estado: **LISTO PARA PROGRAMAR** para las Fases 0–3 y el arranque de la Fase 4 (con modo mock).

Revisión: reconciliación de arquitectura posterior a investigación técnica:

- pg_cron sustituye a Vercel Cron como scheduler de jobs;
- OpenAI y FLUX quedan como candidatos (PENDING VALIDATION), con modo mock para desarrollo sin API keys;
- créditos con reserva transaccional (credits_available / credits_reserved);
- rate limiting en PostgreSQL;
- límites de imagen y retención provisional definidos.

---

## 1. Resumen de lo que se ha entendido

Estamos construyendo un SaaS web para pequeñas inmobiliarias (1–10 agentes) que transforma fotografías de viviendas vacías en imágenes con virtual staging mediante IA.

- El producto NO es un CRM, ni un portal inmobiliario, ni una plataforma de marketing.
- Es una herramienta excelente para una sola tarea: convertir "foto vacía" → "foto amueblada utilizable comercialmente".
- Flujo central: SUBIR → ELEGIR → GENERAR → REVISAR → DESCARGAR.
- MVP profesional pero sin sobreingeniería: una aplicación full-stack, un repositorio, Supabase como backend, jobs asíncronos de IA sobre PostgreSQL, worker en Supabase Edge Functions y una capa mínima de abstracción de proveedores.
- La validación comercial se hará con un piloto de 5–10 inmobiliarias; la señal de éxito es uso recurrente con propiedades reales + pago.

---

## 2. Arquitectura entendida

- **Presentación:** Next.js 16 (App Router, Server Components, Route Handlers, Server Actions) + React 19 + Tailwind CSS v4 + shadcn/ui.
- **Backend:** la propia aplicación Next.js (full-stack). Prohibido un backend separado.
- **Datos:** PostgreSQL vía Supabase; Auth y Storage de Supabase; buckets privados + signed URLs.
- **Servicios de aplicación (capa de reglas de negocio):** PropertyService, GenerationService, UsageService, BillingService, StorageService.
- **Proveedores:** capa de adaptadores. AI: ImageGenerationService → ProviderAdapter → OpenAIAdapter | FluxAdapter (candidatos; decisión pendiente de validación). Pagos: StripeProvider.
- **Worker de IA:** Supabase Edge Function; pg_cron ejecuta `process_jobs()` e invoca la Edge Function (pg_net). Vercel Cron descartado como mecanismo principal; Vercel permanece como despliegue de Next.js. Sin Redis, BullMQ ni colas externas.
- **Generación de IA:** job asíncrono en la tabla `generations`; estados `pending → processing → completed | failed` y `pending → cancelled`; reclamación atómica (`UPDATE ... WHERE status='pending' RETURNING *` + locked_at); retries limitados (retry_count); output determinista por job; límite de concurrencia por organización; rate limiting en PostgreSQL; UI consulta estado mediante polling.
- **Multi-tenancy:** tenant = organización; `organization_id` explícito en entidades críticas; RLS obligatorio como última frontera.
- **Organizaciones:** se crean automáticamente en el registro; el primer usuario es `owner`; invitación de agentes post-MVP.
- **Billing:** Stripe (Checkout, Billing, Webhooks) como autoridad de dinero; nuestra BD registra entitlement, créditos, uso y coste estimado de proveedor en `usage_ledger`. 3 generaciones gratuitas por organización sin tarjeta; consumo transaccional y atómico (reserva y devolución), exclusivamente backend.
- **Storage:** buckets privados `original-images` y `staged-images`; rutas `{organization_id}/{property_id}/{image_id}` y `.../{job_id}`; subida directa desde el navegador con políticas RLS por prefijo; signed URLs cortas para visualización y mayores para descarga.
- **Imágenes:** JPEG/PNG, máx. 10 MB, máx. 4096 × 4096, máx. 20 por propiedad, una generación por job, validación en backend.
- **Retención:** 24 meses como política provisional de MVP (no jurídica).
- **Rate limiting:** PostgreSQL, por organización, configurable.
- **Observabilidad:** Sentry (errores), PostHog + Vercel Analytics (producto/tráfico).
- **Infraestructura:** Vercel (hosting + cron), GitHub Actions (CI), Supabase (base de datos, auth, storage, edge functions).
- Prohibido en MVP: microservicios, backend separado, GraphQL, tRPC, monorepo, cola externa (Redis/BullMQ), Kubernetes.

---

## 3. Flujo del producto entendido

1. Registro / login (Supabase Auth, email+password). El registro crea automáticamente la organización; el primer usuario es `owner`.
2. El usuario pertenece a una organización (una organización principal en MVP).
3. Crea una propiedad (título, dirección opcional).
4. Crea una habitación con tipo (salón, dormitorio, cocina, baño, comedor, despacho, terraza, exterior, otra).
5. Sube la fotografía original (validación MIME/tamaño; se conserva siempre).
6. Selecciona estilo del catálogo (Moderno, Nórdico, Minimalista, Lujo — datos configurables).
7. "Generar staging": validaciones (permisos, imagen, estilo) → entitlement (reserva transaccional de crédito) → creación del job `pending` → pg_cron ejecuta `process_jobs()` → worker (Edge Function) lo procesa → resultado almacenado → `completed` → registro de uso.
8. La UI consulta el estado (polling); al terminar muestra antes/después.
9. Regeneración crea un nuevo resultado (no sobrescribe).
10. Descarga mediante acceso seguro (signed URLs).
11. Errores de proveedor: generación `failed`, devolución del crédito reservado, registrado en `usage_ledger` como `provider_error`.
12. Cancelación antes del procesamiento: `pending → cancelled`, devolución del crédito.
13. Al agotar los 3 créditos gratuitos: bloqueo de nuevas generaciones + flujo de conversión a pago (Fase 7).

---

## 4. Documentos revisados

| Documento | Estado | Observaciones |
|---|---|---|
| `MASTER.md` | Actualizado | Especificación maestra; decisiones aprobadas aplicadas |
| `AGENTS.md` | Actualizado | Instrucciones directas para agentes; stack y reglas actualizadas |
| `README.md` | Actualizado | Entrada del proyecto |
| `docs/PRODUCT.md` | Leído | Producto, ICP, alcance, principios |
| `docs/MVP.md` | Actualizado | Org auto-creada, créditos gratuitos, criterios de aceptación |
| `docs/ARCHITECTURE.md` | Actualizado | Worker Edge Functions, pg_cron, reclamación atómica |
| `docs/TECH_STACK.md` | Actualizado | Candidatos IA, pg_cron, modo mock |
| `docs/DATABASE.md` | Actualizado | Planes free/basic/pro, semántica del ledger, decremento atómico |
| `docs/AI.md` | Actualizado | Candidatos IA, modo mock, reserva de créditos |
| `docs/BILLING.md` | Actualizado | Créditos gratuitos, entitlement backend, estado `free` |
| `docs/SECURITY.md` | Actualizado | Control de créditos exclusivamente backend |
| `docs/DEVELOPMENT.md` | Actualizado | Comandos Supabase CLI local |
| `docs/ROADMAP.md` | Actualizado | Fases 0/2/4/6/8 y Post-MVP alineadas con la investigación |
| `docs/TECHNICAL_DECISIONS.md` | Creado | Registro de decisiones (APPROVED / PROVISIONAL / PENDING VALIDATION) |

Los 14 documentos son coherentes entre sí tras la reconciliación.

---

## 5. Decisiones cerradas

### Decisiones aprobadas por el propietario del proyecto (2026-08-15)

- **D-01 — Host del worker y scheduler:** Supabase Edge Functions + **pg_cron** (PostgreSQL) con `process_jobs()` como vía principal. Vercel Cron descartado como mecanismo principal; Vercel permanece como despliegue de Next.js. Prohibido Redis, BullMQ, Kafka y colas externas. Documentado en ARCHITECTURE.md, TECH_STACK.md, AGENTS.md, MASTER.md.
- **D-02 — Proveedor de IA:** NO cerrado. OpenAI Images API (GPT Image 2) y FLUX son candidatos (PENDING VALIDATION). Ambos se integran vía `ProviderAdapter` (OpenAIAdapter, FluxAdapter). Credenciales solo por variables de entorno. Existe `MockAdapter` para desarrollo sin API keys. Documentado en AI.md, TECHNICAL_DECISIONS.md.
- **D-03 — Alta de organización:** la organización se crea automáticamente durante el registro; el primer usuario es `owner`. La invitación de agentes queda post-MVP. Documentado en DATABASE.md, MVP.md §2.2, MASTER.md §28.
- **D-04 — Entitlement inicial:** 3 generaciones gratuitas por organización, sin tarjeta. Consumo transaccional y atómico con reserva (credits_available / credits_reserved); devolución por error de proveedor o cancelación; exclusivamente backend. Estado `free`. Documentado en BILLING.md, DATABASE.md, SECURITY.md §6.
- **D-05 — Rate limiting en PostgreSQL:** por organización (concurrencia, volumen, créditos), configurable, sin Redis. Documentado en SECURITY.md §9, ARCHITECTURE.md §7.
- **D-06 — Límites de imagen:** JPEG/PNG, 10 MB, 4096 × 4096, 20 por propiedad, una generación por job, validación backend. Documentado en DATABASE.md §7, SECURITY.md §7.
- **D-07 — Retención:** 24 meses como política técnica provisional de MVP (PROVISIONAL, no jurídica); borrado en cascada de imágenes al eliminar propiedad. Documentado en DATABASE.md §13, SECURITY.md §14–15.

### Decisiones previas (cerradas por la documentación)

- Stack completo (Next.js 16, React 19, TS, Tailwind v4, shadcn/ui, Supabase, Vercel, Stripe, Sentry, PostHog, Vercel Analytics).
- Testing: Vitest + Playwright; package manager: pnpm (único).
- Arquitectura de un solo repositorio y una sola aplicación Next.js; sin backend separado.
- Jobs asíncronos en PostgreSQL; cola simple sin sistemas externos.
- Estados de generación: `pending`, `processing`, `completed`, `failed`, `cancelled`.
- Multi-tenancy con `organization_id` + RLS obligatorio.
- Billing con Stripe como fuente de verdad; `usage_ledger` interno; errores de proveedor sin cargo de créditos.
- Buckets de Storage privados + signed URLs.
- Entidades de base de datos definidas (organizations, users, properties, rooms, styles, generations, subscriptions, usage_ledger).
- Ramas `main` / `staging` / `feature/*`; commits pequeños; PR con CI (lint, typecheck, tests).
- Pricing inicial hipótesis 29 €/mes (29 y 49 € como puntos de prueba); Stripe como configuración.
- Prompts centralizados y versionados (`staging_prompt_v1`).

---

## 6. Decisiones todavía abiertas

1. **Plan de Vercel (Hobby vs Pro):** ya no bloquea el worker (pg_cron); afecta dimensionamiento y funcionalidades del despliegue de Next.js.
2. **Idioma de la interfaz** (la documentación de producto es ES, la técnica EN; la UI aún no tiene idioma definido).
3. **Borrado físico vs lógico y confirmación jurídica de retención** (24 meses es política técnica provisional).
4. **Valores concretos del rate limiting** (números exactos configurables).
5. **Mecanismo de incorporación de agentes (post-MVP):** invitación por email, código, manual — pospuesto por D-03.
6. **Proveedor principal de IA y modelo exacto** (OpenAI vs FLUX), modo de edición/mask y configuración óptima — PENDING VALIDATION hasta disponer de credenciales (AI.md §20, TECHNICAL_DECISIONS.md §6).

---

## 7. Contradicciones encontradas y resueltas

Clasificación: CRÍTICO / IMPORTANTE / MENOR.

### Resueltas por las decisiones aprobadas

- **I-01 — Worker sin host definido (CRÍTICO):** resuelto por D-01 (Supabase Edge Functions + pg_cron).
- **I-03 — Modelo de equipo sin definir (IMPORTANTE):** resuelto por D-03 y MVP.md §3 (invitaciones fuera del MVP; org auto-creada con primer usuario owner).
- **M-01 — Listas de stack inconsistentes:** corregido; AGENTS.md §3 ahora incluye Vercel Analytics y el bloque de worker.
- **M-02 — Semántica de campos en `usage_ledger`:** corregido en DATABASE.md; `status` define la clase de consumo (`billable`/`free`/`retry`/`provider_error`) y `reason` documenta el motivo.
- **M-03 — Valores de `subscriptions.plan`:** corregido en DATABASE.md; enumeración `free`/`basic`/`pro`.

### Pendientes

- **I-02 — Catálogo `styles` sin política RLS definida:** DATABASE.md exige RLS en todo y aislamiento por organización, pero `styles` es un catálogo global sin `organization_id`; se debe definir una política de lectura para usuarios autenticados al crear el schema.

---

## 8. Riesgos técnicos

1. **Timeout de funciones serverless vs duración de generación IA** (ALTO): una generación puede tardar 10–60 s. Mitigado: el worker es una Supabase Edge Function; pg_cron solo dispara el procesamiento. El límite de tiempo de ejecución de la Edge Function debe validarse al implementar.
2. **Coste de generación fuera de control** (MEDIO-ALTO): mitigado por diseño (entitlement con reserva, rate limit en PostgreSQL, ledger, límite de concurrencia por organización).
3. **Race conditions en consumo de créditos** (MEDIO): mitigado por la reserva transaccional documentada en DATABASE.md §9 y BILLING.md §6 (SELECT FOR UPDATE + credits_available/credits_reserved).
4. **Procesamiento duplicado de jobs** (MEDIO): mitigado por la reclamación atómica documentada en ARCHITECTURE.md §7 (UPDATE condicional + locked_at).
5. **Fuga de datos multi-tenant vía Storage** (ALTO): la subida es directa desde el navegador; las políticas de `storage.objects` deben validar el prefijo de ruta contra la organización del usuario. Se implementa en Fase 2 y se audita en Fase 9.
6. **Dependencia de proveedor de IA** (MEDIO): decisión de proveedor pendiente; cambios de modelo/pricing afectan coste y calidad; mitigado por la capa de adaptadores, el ledger de costes y el modo mock.
7. **Retención/eliminación de datos** (MEDIO): política provisional (borrado en cascada + 24 meses); requiere revisión jurídica antes del despliegue comercial.
8. **Coste de infraestructura Vercel + Supabase + API de IA** (BAJO-MEDIO): el pricing inicial de 29 €/mes debe cubrir el coste de generación; conviene validar márgenes con el ledger antes del piloto pagado.

---

## 9. Información que falta

1. **Backlog técnico ejecutable**: la documentación tiene ROADMAP.md con fases, pero no tareas numeradas con criterios de aceptación (TASK-001…). Es la pieza que convierte el plan en órdenes de construcción.
2. **Entorno de Supabase**: todavía no existen proyectos (local/dev, staging, prod) ni credenciales. Sin ellas no arranca la Fase 0–2.
3. **Credenciales de IA**: API keys de OpenAI/FLUX para pruebas reales comparativas. NO bloquean el desarrollo (modo mock); bloquean únicamente la decisión final de proveedor (PENDING VALIDATION).
4. **Cuentas de servicios**: Stripe (test + prod), Sentry, PostHog, Vercel (plan y dominio) sin configurar.
5. **`.env.example`**: la convención existe en el `.gitignore` pero el archivo de ejemplo no se ha creado (se hará en Fase 0).
6. **Skeleton del proyecto**: package.json, tsconfig, next.config, CI workflow… (Fase 0).
7. **Valores concretos**: tamaño máximo de imagen, MIME permitidos, duración de signed URLs, período de retención de datos.
8. **Decisión comercial**: precio/créditos exactos por plan (la documentación los deja como hipótesis; Stripe será la fuente).

---

## 10. Preguntas que necesitan respuesta humana

1. ¿Cuál es el plan de Vercel (Hobby vs Pro)? Afecta al dimensionamiento del despliegue, no al worker.
2. ¿El idioma de la interfaz será español, inglés o ambos?
3. ¿Borrado físico o lógico de propiedades/habitaciones/imágenes? ¿Se confirma la retención de 24 meses a nivel jurídico?
4. ¿Qué valores concretos para el rate limiting por organización?
5. ¿Cuándo estarán disponibles las API keys de OpenAI/FLUX para las pruebas comparativas y la decisión final de proveedor?

---

## 11. Checklist de condiciones para comenzar el desarrollo

Condiciones mínimas para arrancar la **Fase 0 (Foundation)**:

- [x] Repositorio GitHub creado y accesible (`gfromtheD/imobiliaria`, privado).
- [x] Documentación completa en el repositorio (14 documentos, incluido MASTER.md y TECHNICAL_DECISIONS.md).
- [x] Decisiones críticas resueltas (worker con pg_cron, candidatos IA con modo mock, alta de organización, entitlement inicial, rate limiting, límites de imagen, retención provisional).
- [x] Acceso verificado: lectura, escritura, commits, push, ramas.
- [ ] Backlog técnico ejecutable (TASK-001…) con criterios de aceptación.
- [ ] Cuenta de Supabase accesible (credenciales de dev o local).
- [ ] Cuenta de Stripe (modo test) accesible.
- [ ] Cuentas de Sentry y PostHog (se pueden posponer a Fase 8, no bloquean Fase 0).

Condiciones para desplegar la **Fase 4 (AI Engine)**:

- [ ] API keys de OpenAI/FLUX para pruebas reales (no bloquean el desarrollo gracias al modo mock).
- [ ] Política RLS de lectura para `styles` (I-02).
- [ ] Validación del límite de tiempo de ejecución de la Edge Function del worker.

---

## Veredicto

- La documentación es coherente y suficiente para las Fases 0–3 y el arranque de la Fase 4 (en modo mock).
- La reconciliación con la investigación técnica está aplicada: pg_cron como scheduler, proveedor IA abierto (candidatos + mock), reserva transaccional de créditos, rate limiting en PostgreSQL, límites de imagen y retención provisional.
- No quedan bloqueos técnicos para comenzar: el desarrollo no depende de API keys, ni de plan Vercel, ni de Stripe (salvo Fase 7).
- El siguiente paso lógico es convertir ROADMAP.md en backlog ejecutable (TASK-001…) y resolver las preguntas humanas 1–5 de la sección 10.
