# PROJECT_AUDIT.md

Auditoría inicial del proyecto previa al desarrollo.

Fecha: 2026-08-15

Estado: **NO LISTO PARA PROGRAMAR hasta resolver los puntos CRÍTICOS señalados.**

---

## 1. Resumen de lo que se ha entendido

Estamos construyendo un SaaS web para pequeñas inmobiliarias (1–10 agentes) que transforma fotografías de viviendas vacías en imágenes con virtual staging mediante IA.

- El producto NO es un CRM, ni un portal inmobiliario, ni una plataforma de marketing.
- Es una herramienta excelente para una sola tarea: convertir "foto vacía" → "foto amueblada utilizable comercialmente".
- Flujo central: SUBIR → ELEGIR → GENERAR → REVISAR → DESCARGAR.
- MVP profesional pero sin sobreingeniería: una aplicación full-stack, un repositorio, Supabase como backend, jobs asíncronos de IA sobre PostgreSQL, worker simple y una capa mínima de abstracción de proveedores.
- La validación comercial se hará con un piloto de 5–10 inmobiliarias; la señal de éxito es uso recurrente con propiedades reales + pago.

---

## 2. Arquitectura entendida

- **Presentación:** Next.js 16 (App Router, Server Components, Route Handlers, Server Actions) + React 19 + Tailwind CSS v4 + shadcn/ui.
- **Backend:** la propia aplicación Next.js (full-stack). Prohibido un backend separado.
- **Datos:** PostgreSQL vía Supabase; Auth y Storage de Supabase; buckets privados + signed URLs.
- **Servicios de aplicación (capa de reglas de negocio):** PropertyService, GenerationService, UsageService, BillingService, StorageService.
- **Proveedores:** capa de adaptadores. AI: ImageGenerationService → ProviderAdapter → FluxAdapter | OpenAIAdapter. Pagos: StripeProvider.
- **Generación de IA:** job asíncrono almacenado en la tabla `generations`; estados `pending → processing → succeeded | failed`; worker simple que reclama jobs de la cola en PostgreSQL; UI consulta estado mediante polling.
- **Multi-tenancy:** tenant = organización; `organization_id` explícito en entidades críticas; RLS obligatorio como última frontera.
- **Billing:** Stripe (Checkout, Billing, Webhooks) como autoridad de dinero; nuestra BD registra entitlement, créditos, uso y coste estimado de proveedor en `usage_ledger`.
- **Observabilidad:** Sentry (errores), PostHog + Vercel Analytics (producto/tráfico).
- **Infraestructura:** Vercel (hosting), GitHub Actions (CI), Supabase (base de datos, auth, storage, edge functions).
- Prohibido en MVP: microservicios, backend separado, GraphQL, tRPC, monorepo, cola externa, Kubernetes.

---

## 3. Flujo del producto entendido

1. Registro / login (Supabase Auth, email+password).
2. El usuario pertenece a una organización (una organización principal en MVP).
3. Crea una propiedad (título, dirección opcional).
4. Crea una habitación con tipo (salón, dormitorio, cocina, baño, comedor, despacho, terraza, exterior, otra).
5. Sube la fotografía original (validación MIME/tamaño; se conserva siempre).
6. Selecciona estilo del catálogo (Moderno, Nórdico, Minimalista, Lujo — datos configurables).
7. "Generar staging": validaciones (permisos, imagen, estilo) → entitlement (suscripción + créditos) → creación del job `pending` → worker lo procesa → resultado almacenado → `succeeded` → registro de uso.
8. La UI consulta el estado (polling); al terminar muestra antes/después.
9. Regeneración crea un nuevo resultado (no sobrescribe).
10. Descarga mediante acceso seguro (signed URLs).
11. Errores de proveedor: generación `failed`, sin descuento de crédito, registrado en `usage_ledger` como `provider_error`.

---

## 4. Documentos revisados

| Documento | Estado | Observaciones |
|---|---|---|
| `MASTER.md` | Leído | Especificación maestra; jerarquía de documentos clara |
| `AGENTS.md` | Leído | Instrucciones directas para agentes; reglas no negociables |
| `README.md` | Leído | Entrada del proyecto |
| `docs/PRODUCT.md` | Leído | Producto, ICP, alcance, principios |
| `docs/MVP.md` | Leído | Alcance funcional y criterios de aceptación |
| `docs/ARCHITECTURE.md` | Leído | Capas, flujos, jobs, reglas de arquitectura |
| `docs/TECH_STACK.md` | Leído | Stack aprobado |
| `docs/DATABASE.md` | Leído | Entidades, relaciones, RLS |
| `docs/AI.md` | Leído | Pipeline de IA, adaptadores, fallback |
| `docs/BILLING.md` | Leído | Stripe, créditos, entitlement, ledger |
| `docs/SECURITY.md` | Leído | Reglas de seguridad mínimas |
| `docs/DEVELOPMENT.md` | Leído | Proceso de desarrollo, git, CI |
| `docs/ROADMAP.md` | Leído | Fases de implementación |

Los 13 documentos se leyeron de forma íntegra y coherente entre sí. No falta documentación maestra: la estructura está completa y accesible.

---

## 5. Decisiones ya tomadas (cerradas por la documentación)

- Stack completo (Next.js 16, React 19, TS, Tailwind v4, shadcn/ui, Supabase, Vercel, Stripe, Sentry, PostHog).
- Testing: Vitest + Playwright (preferencia fijada); package manager: pnpm (único).
- Arquitectura de un solo repositorio y una sola aplicación Next.js; sin backend separado.
- Capa de abstracción de IA: `ImageGenerationService` + `ProviderAdapter` (FluxAdapter, OpenAIAdapter); prohibido llamar proveedores desde UI.
- Proveedor principal FLUX; fallback OpenAI GPT Image 2.
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

1. **Host del worker de IA** (CRÍTICO para Fase 4): la documentación define el worker pero no dónde se ejecuta. Opciones: Vercel Cron (requiere plan Pro) sobre route handler, Supabase Edge Function con timer, o disparo tras la creación del job. Depende además del plan de Vercel contratado.
2. **Proveedor concreto de FLUX**: la documentación dice "Fal.ai o proveedor equivalente definido durante implementación". Antes de escribir `FluxAdapter` hay que fijar proveedor, modelo, endpoint y SDK.
3. **Flujo de alta de organización**: ¿la organización se crea automáticamente en el registro del primer usuario? ¿Cómo se incorpora un segundo agente (invitación, código, manual)? Afecta a Fase 1.
4. **Estado inicial de entitlement**: ¿qué puede hacer un usuario sin suscripción? ¿Créditos de prueba? ¿Bloqueo de generación? Afecta a Fases 4 y 6.
5. **Mecanismo de rate limiting**: requerido por SECURITY.md sin mecanismo definido (no añadir dependencias sin justificación). Posibilidades: límite en BD con reset por período, checks en servicios, límites de Vercel.
6. **Vía de subida de imágenes**: ¿subida directa cliente → Supabase Storage (con políticas de Storage por carpeta de organización) o subida vía server action/route handler? Define las políticas de Storage y signed URLs.
7. **Semántica de borrado**: ¿borrado físico o lógico? ¿Qué pasa con archivos en Storage (originales y generados) al eliminar propiedad/room? ¿Periodo de retención GDPR?
8. **Límites de validación de imágenes**: tamaño máximo en MB, MIME permitidos, dimensiones mínimas.
9. **Décremento de créditos atómico**: cómo evitar consumo concurrente que supere el límite (UPDATE atómico/row lock) y cómo se resetea `credits_used` en el límite del período.
10. **Idioma de la interfaz** (la documentación de producto es ES, la técnica EN; la UI aún no tiene idioma definido).

---

## 7. Contradicciones encontradas

Clasificación: CRÍTICO / IMPORTANTE / MENOR.

### IMPORTANTE

- **I-01 — Worker sin host definido (incompleto, no contradictorio):** ARCHITECTURE.md §7 y AI.md definen el worker pero ninguna sección define dónde se ejecuta. No es una contradicción entre documentos, pero es la mayor laguna operativa: sin esta decisión no se puede construir el pipeline de IA de forma correcta.
- **I-02 — Catálogo `styles` sin política RLS definida:** DATABASE.md exige RLS en todo y aislamiento por organización, pero `styles` es un catálogo global sin `organization_id`; no se define cómo lo leen los usuarios autenticados (política de lectura para authenticated). Gap de diseño, no contradicción.
- **I-03 — Modelo de equipo sin definir:** MVP.md contempla usuarios con rol `owner`/`agent` dentro de una organización, pero no se define cómo se crean esos usuarios (solo el registro individual). Si el MVP permite equipos, hace falta el mecanismo de incorporación.

### MENOR

- **M-01 — Listas de stack inconsistentes:** `AGENTS.md` (§3 STACK) no incluye Vercel Analytics, mientras que `TECH_STACK.md` y `README.md` sí lo incluyen. No afecta a la arquitectura; conviene unificar.
- **M-02 — Semántica de campos en `usage_ledger`:** se listan `status` y `reason`; los valores documentados (`billable`, `free`, `retry`, `provider_error`) describen razones más que estados. Conviene aclarar el nombre y valores finales en la migración inicial.
- **M-03 — Valores de `subscriptions.plan`:** el campo `plan` no tiene enumeración definida (¿free/basic/pro? ¿ids de precios de Stripe?). Definirlo al crear el schema.

---

## 8. Riesgos técnicos

1. **Timeout de funciones serverless vs duración de generación IA** (ALTO): una generación FLUX/GPT Image puede tardar 10–60 s. En Vercel Hobby el límite de función es corto y no hay cron; hay que decidir plan (Pro) o vía alternativa (Edge Function) para el worker.
2. **Coste de generación fuera de control** (MEDIO-ALTO): mitigado parcialmente por diseño (entitlement, rate limit, ledger), pero sin límite máximo de generaciones simultáneas por organización puede producirse pico de coste. Añadir máximo de jobs concurrentes por org en el worker.
3. **Race conditions en consumo de créditos** (MEDIO): chequeo de entitlement + decremento no atómico puede permitir sobreconsumo con peticiones concurrentes. Mitigar con UPDATE condicional atómico.
4. **Procesamiento duplicado de jobs** (MEDIO): el worker debe reclamar jobs atómicamente (`UPDATE ... WHERE status='pending' RETURNING`); la documentación lo exige pero no especifica mecanismo.
5. **Fuga de datos multi-tenant vía Storage** (ALTO): si la subida es cliente→Storage, las políticas de `storage.objects` deben validar el prefijo de ruta contra la organización del usuario; mal diseñado, cualquier usuario autenticado podría listar/leer archivos ajenos.
6. **Dependencia de proveedor de IA** (MEDIO): cambios de modelo/pricing de FLUX/OpenAI afectan coste y calidad; mitigado por la capa de adaptadores y el ledger de costes.
7. **Retención/eliminación de datos** (MEDIO): sin política definida (soft/hard delete, cleanup de Storage, retención GDPR) se acumulan datos personales e imágenes de clientes sin control.
8. **Coste de infraestructura Vercel Pro + Supabase Pro + API de IA** (BAJO-MEDIO): el pricing inicial de 29 €/mes debe cubrir el coste de generación; conviene validar márgenes con el ledger antes del piloto pagado.

---

## 9. Información que falta

1. **Backlog técnico ejecutable**: la documentación tiene ROADMAP.md con fases, pero no tareas numeradas con criterios de aceptación (TASK-001…). Es la pieza que convierte el plan en órdenes de construcción.
2. **Entorno de Supabase**: todavía no existen proyectos (local/dev, staging, prod) ni credenciales. Sin ellas no arranca la Fase 0–2.
3. **Credenciales de IA**: API key de Fal.ai (o proveedor elegido) y de OpenAI para dev/staging.
4. **Cuentas de servicios**: Stripe (test + prod), Sentry, PostHog, Vercel (plan y dominio) sin configurar.
5. **`.env.example`**: la convención existe en el `.gitignore` pero el archivo de ejemplo no se ha creado (se hará en Fase 0).
6. **Skeleton del proyecto**: package.json, tsconfig, next.config, CI workflow… (Fase 0).
7. **Valores concretos**: tamaño máximo de imagen, MIME permitidos, duración de signed URLs, período de retención de datos.
8. **Decisión comercial**: precio/créditos exactos por plan (la documentación los deja como hipótesis; Stripe será la fuente).

---

## 10. Preguntas que necesitan respuesta humana

1. ¿Cuál es el plan de Vercel (Hobby vs Pro)? Determina si el worker puede ser un cron de Vercel.
2. ¿Dónde queréis ejecutar el worker: Vercel Cron, Supabase Edge Function u otra vía?
3. ¿Qué proveedor/modelo FLUX concreto se usa (Fal.ai u otro) y con qué API key?
4. ¿La organización se crea automáticamente en el registro del primer usuario, o hay flujo separado de creación?
5. ¿Puede haber más de un agente por organización en el MVP? Si sí, ¿cómo se incorpora (invitación por email, código, manual)?
6. ¿Qué puede generar un usuario sin suscripción activa? ¿Créditos de prueba gratuitos? ¿Cuántos?
7. ¿Subida de imágenes directa desde el cliente a Supabase Storage, o a través del servidor?
8. ¿Borrado físico o lógico de propiedades/habitaciones/imágenes? ¿Periodo de retención GDPR?
9. ¿Máximo de imágenes por habitación y por propiedad? (No está definido en los documentos.)
10. ¿El idioma de la interfaz será español, inglés o ambos?

---

## 11. Checklist de condiciones para comenzar el desarrollo

Condiciones mínimas para arrancar la **Fase 0 (Foundation)**:

- [x] Repositorio GitHub creado y accesible (`gfromtheD/imobiliaria`, privado).
- [x] Documentación completa en el repositorio (13 documentos, incluido MASTER.md).
- [x] Acceso verificado: lectura, escritura, commits, push, ramas.
- [ ] Backlog técnico ejecutable (TASK-001…) con criterios de aceptación.
- [ ] Decisión del plan de Vercel (Hobby/Pro).
- [ ] Cuenta de Supabase accesible (credenciales de dev o local).
- [ ] Cuenta de Stripe (modo test) accesible.
- [ ] API key de IA para desarrollo (Fal.ai y/o OpenAI).
- [ ] Cuentas de Sentry y PostHog (se pueden posponer a Fase 8, no bloquean Fase 0).
- [ ] Resolución de las preguntas humanas críticas: worker (P1/P2), proveedor IA (P3), alta de organización (P4/P5), entitlement inicial (P6).

Condiciones para empezar la **Fase 4 (AI Engine)** — bloqueantes adicionales:

- [ ] Host del worker decidido (P1/P2).
- [ ] Proveedor FLUX concreto y credenciales (P3).
- [ ] Entitlement inicial definido (P6).
- [ ] Mecanismo de reclamación atómica de jobs y límite de concurrencia por organización.

---

## Veredicto

- La documentación es de alta calidad, coherente en lo esencial y suficiente para las Fases 0–3.
- **No se debe iniciar la Fase 4 (AI Engine) ni la Fase 6 (Usage)** sin resolver las decisiones abiertas críticas (worker, proveedor concreto, entitlement inicial).
- Las contradicciones encontradas son menores/importantes pero ninguna exige reescribir la arquitectura.
- El siguiente paso lógico es convertir ROADMAP.md en backlog ejecutable (TASK-001…) y resolver las preguntas humanas 1–6.
