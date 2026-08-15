# PROJECT_AUDIT.md

Auditoría del proyecto y revisión posterior a las decisiones aprobadas.

Fecha: 2026-08-15

Estado: **LISTO PARA PROGRAMAR** para las Fases 0–3 y el arranque de la Fase 4.

Las 4 decisiones arquitectónicas críticas han sido resueltas y aplicadas a la documentación.

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
- **Proveedores:** capa de adaptadores. AI: ImageGenerationService → ProviderAdapter → OpenAIAdapter (inicial) | FluxAdapter (futuro). Pagos: StripeProvider.
- **Worker de IA:** Supabase Edge Function; Vercel Cron activa el worker y reintenta jobs pendientes/fallidos recuperables. Sin Redis, BullMQ ni colas externas.
- **Generación de IA:** job asíncrono en la tabla `generations`; estados `pending → processing → succeeded | failed`; reclamación atómica (`UPDATE ... WHERE status='pending' RETURNING *`); límite de concurrencia por organización; UI consulta estado mediante polling.
- **Multi-tenancy:** tenant = organización; `organization_id` explícito en entidades críticas; RLS obligatorio como última frontera.
- **Organizaciones:** se crean automáticamente en el registro; el primer usuario es `owner`; invitación de agentes post-MVP.
- **Billing:** Stripe (Checkout, Billing, Webhooks) como autoridad de dinero; nuestra BD registra entitlement, créditos, uso y coste estimado de proveedor en `usage_ledger`. 3 generaciones gratuitas por organización sin tarjeta; decremento de créditos exclusivamente backend y atómico.
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
7. "Generar staging": validaciones (permisos, imagen, estilo) → entitlement (créditos gratuitos o suscripción) → creación del job `pending` → worker (Edge Function vía Vercel Cron) lo procesa → resultado almacenado → `succeeded` → registro de uso.
8. La UI consulta el estado (polling); al terminar muestra antes/después.
9. Regeneración crea un nuevo resultado (no sobrescribe).
10. Descarga mediante acceso seguro (signed URLs).
11. Errores de proveedor: generación `failed`, sin descuento de crédito, registrado en `usage_ledger` como `provider_error`.
12. Al agotar los 3 créditos gratuitos: bloqueo de nuevas generaciones + flujo de conversión a pago (Fase 7).

---

## 4. Documentos revisados

| Documento | Estado | Observaciones |
|---|---|---|
| `MASTER.md` | Actualizado | Especificación maestra; decisiones aprobadas aplicadas |
| `AGENTS.md` | Actualizado | Instrucciones directas para agentes; stack y reglas actualizadas |
| `README.md` | Actualizado | Entrada del proyecto |
| `docs/PRODUCT.md` | Leído | Producto, ICP, alcance, principios |
| `docs/MVP.md` | Actualizado | Org auto-creada, créditos gratuitos, criterios de aceptación |
| `docs/ARCHITECTURE.md` | Actualizado | Worker Edge Functions, Vercel Cron, reclamación atómica |
| `docs/TECH_STACK.md` | Actualizado | Proveedor inicial OpenAI, alternativa futura FLUX |
| `docs/DATABASE.md` | Actualizado | Planes free/basic/pro, semántica del ledger, decremento atómico |
| `docs/AI.md` | Actualizado | OpenAI Images API inicial; FLUX como alternativa futura |
| `docs/BILLING.md` | Actualizado | Créditos gratuitos, entitlement backend, estado `free` |
| `docs/SECURITY.md` | Actualizado | Control de créditos exclusivamente backend |
| `docs/DEVELOPMENT.md` | Actualizado | Comandos Supabase CLI local |
| `docs/ROADMAP.md` | Actualizado | Fases 0/1/4/6/7 y Post-MVP alineadas con las decisiones |

Los 13 documentos son coherentes entre sí tras la actualización.

---

## 5. Decisiones cerradas

### Decisiones aprobadas por el propietario del proyecto (2026-08-15)

- **D-01 — Host del worker:** Supabase Edge Functions. **Vercel Cron** activa el worker y reintenta jobs. Prohibido Redis, BullMQ y colas externas. Documentado en ARCHITECTURE.md §5–§7, TECH_STACK.md, AGENTS.md, MASTER.md.
- **D-02 — Proveedor de IA inicial:** OpenAI Images API (GPT Image 2). FLUX pasa a ser alternativa futura (post-MVP). Se mantiene `ImageGenerationService` + `ProviderAdapter`; primero `OpenAIAdapter`. Documentado en AI.md §2–§3, §6.
- **D-03 — Alta de organización:** la organización se crea automáticamente durante el registro; el primer usuario es `owner`. La invitación de agentes queda post-MVP. Documentado en DATABASE.md, MVP.md §2.2, MASTER.md §28.
- **D-04 — Entitlement inicial:** 3 generaciones gratuitas por organización, sin tarjeta. Control y decremento de créditos exclusivamente backend (operación atómica). Al agotarse: bloqueo de generación + flujo de conversión a pago. Estado `free` en `subscriptions`. Documentado en BILLING.md, DATABASE.md §9, SECURITY.md §6.

### Decisiones previas (cerradas por la documentación)

- Stack completo (Next.js 16, React 19, TS, Tailwind v4, shadcn/ui, Supabase, Vercel, Stripe, Sentry, PostHog, Vercel Analytics).
- Testing: Vitest + Playwright; package manager: pnpm (único).
- Arquitectura de un solo repositorio y una sola aplicación Next.js; sin backend separado.
- Jobs asíncronos en PostgreSQL; cola simple sin sistemas externos.
- Estados de generación: `pending`, `processing`, `succeeded`, `failed`.
- Multi-tenancy con `organization_id` + RLS obligatorio.
- Billing con Stripe como fuente de verdad; `usage_ledger` interno; errores de proveedor sin cargo de créditos.
- Buckets de Storage privados + signed URLs.
- Entidades de base de datos definidas (organizations, users, properties, rooms, styles, generations, subscriptions, usage_ledger).
- Ramas `main` / `staging` / `feature/*`; commits pequeños; PR con CI (lint, typecheck, tests).
- Pricing inicial hipótesis 29 €/mes (29 y 49 € como puntos de prueba); Stripe como configuración.
- Prompts centralizados y versionados (`staging_prompt_v1`).

---

## 6. Decisiones todavía abiertas

1. **Plan de Vercel (Hobby vs Pro):** Vercel Cron requiere plan Pro. No bloquea Fases 0–3; bloquea el despliegue de Fase 4.
2. **Mecanismo de rate limiting:** requerido por SECURITY.md sin mecanismo definido (no añadir dependencias sin justificación). Posibilidades: límite en BD con reset por período, checks en servicios, límites de Vercel.
3. **Vía de subida de imágenes:** ¿subida directa cliente → Supabase Storage (con políticas de Storage por carpeta de organización) o subida vía server action/route handler? Define las políticas de Storage y signed URLs.
4. **Semántica de borrado:** ¿borrado físico o lógico? ¿Qué pasa con archivos en Storage (originales y generados) al eliminar propiedad/room? ¿Periodo de retención GDPR?
5. **Límites de validación de imágenes:** tamaño máximo en MB, MIME permitidos, dimensiones mínimas.
6. **Idioma de la interfaz** (la documentación de producto es ES, la técnica EN; la UI aún no tiene idioma definido).
7. **Máximo de imágenes por habitación y por propiedad.**
8. **Mecanismo de incorporación de agentes (post-MVP):** invitación por email, código, manual — decisión de diseño pospuesta por D-03.

---

## 7. Contradicciones encontradas y resueltas

Clasificación: CRÍTICO / IMPORTANTE / MENOR.

### Resueltas por las decisiones aprobadas

- **I-01 — Worker sin host definido (CRÍTICO):** resuelto por D-01 (Supabase Edge Functions + Vercel Cron).
- **I-03 — Modelo de equipo sin definir (IMPORTANTE):** resuelto por D-03 y MVP.md §3 (invitaciones fuera del MVP; org auto-creada con primer usuario owner).
- **M-01 — Listas de stack inconsistentes:** corregido; AGENTS.md §3 ahora incluye Vercel Analytics y el bloque de worker.
- **M-02 — Semántica de campos en `usage_ledger`:** corregido en DATABASE.md; `status` define la clase de consumo (`billable`/`free`/`retry`/`provider_error`) y `reason` documenta el motivo.
- **M-03 — Valores de `subscriptions.plan`:** corregido en DATABASE.md; enumeración `free`/`basic`/`pro`.

### Pendientes

- **I-02 — Catálogo `styles` sin política RLS definida:** DATABASE.md exige RLS en todo y aislamiento por organización, pero `styles` es un catálogo global sin `organization_id`; se debe definir una política de lectura para usuarios autenticados al crear el schema.

---

## 8. Riesgos técnicos

1. **Timeout de funciones serverless vs duración de generación IA** (ALTO): una generación GPT Image puede tardar 10–60 s. Mitigado: el worker es una Supabase Edge Function (sin timeout restrictivo de Vercel); Vercel Cron solo activa y reintenta. Pendiente: plan de Vercel Pro para cron.
2. **Coste de generación fuera de control** (MEDIO-ALTO): mitigado por diseño (entitlement, rate limit, ledger, límite de concurrencia por organización). El límite de concurrencia queda documentado en ARCHITECTURE.md §7.
3. **Race conditions en consumo de créditos** (MEDIO): mitigado por el decremento atómico documentado en DATABASE.md §9 y BILLING.md §6 (`UPDATE ... WHERE credits_used < credits_limit`).
4. **Procesamiento duplicado de jobs** (MEDIO): mitigado por la reclamación atómica documentada en ARCHITECTURE.md §7 (`UPDATE ... WHERE status='pending' RETURNING *`).
5. **Fuga de datos multi-tenant vía Storage** (ALTO): pendiente de la decisión sobre la vía de subida; si es cliente→Storage, las políticas de `storage.objects` deben validar el prefijo de ruta contra la organización del usuario.
6. **Dependencia de proveedor de IA** (MEDIO): cambios de modelo/pricing de OpenAI afectan coste y calidad; mitigado por la capa de adaptadores y el ledger de costes.
7. **Retención/eliminación de datos** (MEDIO): sin política definida (soft/hard delete, cleanup de Storage, retención GDPR) se acumulan datos personales e imágenes de clientes sin control.
8. **Coste de infraestructura Vercel Pro + Supabase Pro + API de IA** (BAJO-MEDIO): el pricing inicial de 29 €/mes debe cubrir el coste de generación; conviene validar márgenes con el ledger antes del piloto pagado.

---

## 9. Información que falta

1. **Backlog técnico ejecutable**: la documentación tiene ROADMAP.md con fases, pero no tareas numeradas con criterios de aceptación (TASK-001…). Es la pieza que convierte el plan en órdenes de construcción.
2. **Entorno de Supabase**: todavía no existen proyectos (local/dev, staging, prod) ni credenciales. Sin ellas no arranca la Fase 0–2.
3. **Credenciales de IA**: API key de OpenAI (proveedor inicial) para dev/staging.
4. **Cuentas de servicios**: Stripe (test + prod), Sentry, PostHog, Vercel (plan y dominio) sin configurar.
5. **`.env.example`**: la convención existe en el `.gitignore` pero el archivo de ejemplo no se ha creado (se hará en Fase 0).
6. **Skeleton del proyecto**: package.json, tsconfig, next.config, CI workflow… (Fase 0).
7. **Valores concretos**: tamaño máximo de imagen, MIME permitidos, duración de signed URLs, período de retención de datos.
8. **Decisión comercial**: precio/créditos exactos por plan (la documentación los deja como hipótesis; Stripe será la fuente).

---

## 10. Preguntas que necesitan respuesta humana

1. ¿Cuál es el plan de Vercel (Hobby vs Pro)? Determina cuándo puede desplegarse el cron de la Fase 4.
2. ¿Qué mecanismo de rate limiting se adopta (BD, servicios, Vercel)?
3. ¿Subida de imágenes directa desde el cliente a Supabase Storage, o a través del servidor?
4. ¿Borrado físico o lógico de propiedades/habitaciones/imágenes? ¿Periodo de retención GDPR?
5. ¿Tamaño máximo y MIME permitidos para las imágenes de entrada?
6. ¿Máximo de imágenes por habitación y por propiedad?
7. ¿El idioma de la interfaz será español, inglés o ambos?

---

## 11. Checklist de condiciones para comenzar el desarrollo

Condiciones mínimas para arrancar la **Fase 0 (Foundation)**:

- [x] Repositorio GitHub creado y accesible (`gfromtheD/imobiliaria`, privado).
- [x] Documentación completa en el repositorio (13 documentos, incluido MASTER.md).
- [x] Decisiones críticas resueltas (worker, proveedor IA, alta de organización, entitlement inicial).
- [x] Acceso verificado: lectura, escritura, commits, push, ramas.
- [ ] Backlog técnico ejecutable (TASK-001…) con criterios de aceptación.
- [ ] Decisión del plan de Vercel (Hobby/Pro).
- [ ] Cuenta de Supabase accesible (credenciales de dev o local).
- [ ] Cuenta de Stripe (modo test) accesible.
- [ ] API key de OpenAI para desarrollo.
- [ ] Cuentas de Sentry y PostHog (se pueden posponer a Fase 8, no bloquean Fase 0).

Condiciones para desplegar la **Fase 4 (AI Engine)**:

- [ ] Plan de Vercel Pro (Vercel Cron).
- [ ] API key de OpenAI para el entorno correspondiente.
- [ ] Política RLS de lectura para `styles` (I-02).
- [ ] Definición de la vía de subida de imágenes (P3 de la sección 10).

---

## Veredicto

- La documentación es de alta calidad, coherente y suficiente para las Fases 0–3 y el arranque de la Fase 4.
- Las 4 decisiones críticas (worker, proveedor IA, alta de organización, entitlement inicial) están resueltas y documentadas.
- Los riesgos restantes (plan de Vercel Pro para cron, rate limiting, subida, borrado/GDPR) son decisiones operativas o de fase posterior, no bloqueantes de las Fases 0–3.
- El siguiente paso lógico es convertir ROADMAP.md en backlog ejecutable (TASK-001…) y resolver las preguntas humanas 1–7 de la sección 10.
