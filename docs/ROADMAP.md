# ROADMAP.md

## Objetivo

Construir el MVP en el orden correcto, reduciendo dependencias y evitando trabajo prematuro.

---

# FASE 0 — FOUNDATION

## Objetivo

Crear la base técnica.

### Tareas

- crear repositorio;
- configurar Next.js;
- configurar TypeScript;
- configurar Tailwind;
- configurar shadcn/ui;
- configurar Supabase;
- configurar Supabase CLI local;
- configurar Edge Functions localmente;
- configurar variables de entorno;
- configurar lint;
- configurar tests;
- crear documentación inicial.

### Resultado

Aplicación ejecutándose localmente.

---

# FASE 1 — AUTH + MULTI-TENANCY

### Tareas

- Supabase Auth;
- register (con auto-creación de organización);
- login;
- logout;
- password reset;
- organizations;
- users;
- roles;
- RLS.

### Resultado

Un usuario puede acceder únicamente a su organización.

Su organización se crea automáticamente en el registro.

---

# FASE 2 — DATABASE + STORAGE

### Tareas

Crear:

- organizations;
- users;
- properties;
- rooms;
- styles;
- generations;
- subscriptions;
- usage_ledger.

Configurar:

- Storage;
- buckets;
- RLS;
- signed URLs.

### Resultado

Infraestructura persistente lista.

---

# FASE 3 — PROPERTY MANAGEMENT

### Tareas

- dashboard;
- lista propiedades;
- crear propiedad;
- detalle;
- crear room;
- subir imagen;
- visualizar imagen.

### Resultado

La inmobiliaria puede gestionar sus propiedades y fotografías.

---

# FASE 4 — AI ENGINE

### Tareas

- GenerationService;
- ImageGenerationService;
- ProviderAdapter;
- OpenAIAdapter (proveedor inicial);
- FluxAdapter (alternativa futura, no incluida en esta fase);
- generation states;
- worker (Supabase Edge Function);
- scheduler (Vercel Cron);
- retry;
- almacenamiento de resultado.

### Resultado

Una fotografía puede transformarse mediante IA.

El worker procesa los jobs de forma asíncrona.

Vercel Cron activa y reintenta.

---

# FASE 5 — RESULTS

### Tareas

- generación loading;
- estado;
- resultado;
- before/after;
- regeneración;
- descarga.

### Resultado

Flujo principal completo.

---

# FASE 6 — USAGE

### Tareas

- credits;
- 3 créditos gratuitos por organización al registrarse;
- sin tarjeta para usar los créditos gratuitos;
- entitlement;
- decremento de créditos exclusivamente backend;
- bloqueo de generación al agotar créditos;
- flujo de conversión a pago;
- usage ledger;
- cost estimate;
- límites;
- provider errors;
- retries.

### Resultado

Sabemos cuánto consume cada organización.

Controlamos los créditos gratuitos sin depender del frontend.

---

# FASE 7 — BILLING

### Tareas

- Stripe;
- Checkout;
- subscriptions;
- webhooks;
- plans;
- entitlement;
- conversion desde free;
- cancellation.

### Resultado

La aplicación puede cobrar.

Los créditos gratuitos agotados se convierten en suscripciones de pago.

---

# FASE 8 — ANALYTICS + MONITORING

### Tareas

Sentry.

PostHog.

Vercel Analytics.

Eventos:

- signup;
- login_success;
- organization_created;
- property_created;
- room_created;
- image_uploaded;
- generation_started;
- generation_succeeded;
- generation_failed;
- image_downloaded;
- subscription_started;
- subscription_cancelled.

---

# FASE 9 — SECURITY HARDENING

Revisar:

- RLS;
- auth;
- storage;
- uploads;
- rate limiting;
- secrets;
- Stripe webhooks;
- generation endpoint.

---

# FASE 10 — TESTING

Critical tests:

- auth;
- RLS;
- properties;
- image upload;
- generation;
- usage;
- billing.

E2E:

signup
→ property
→ upload
→ generation
→ result
→ download.

---

# FASE 11 — POLISH

Mejorar:

- copy;
- loading;
- errors;
- empty states;
- responsive design;
- UX;
- performance.

No añadir nuevas funcionalidades importantes.

---

# FASE 12 — PRODUCTION

Checklist:

- environment variables;
- production Supabase;
- production Stripe;
- production AI provider;
- Vercel;
- Sentry;
- PostHog;
- CI/CD;
- backups;
- tests.

---

# 7-DAY TARGET

## Día 1

Foundation.

## Día 2

Auth + multi-tenancy.

## Día 3

Database + storage + properties.

## Día 4

AI pipeline.

## Día 5

Results.

## Día 6

Usage + billing.

## Día 7

Testing + observability + polish + deployment.

---

# POST-MVP

Después de validar:

1. Mejorar calidad.
2. Mejorar estilos.
3. Mejorar velocidad.
4. Analizar retención.
5. Analizar economía.
6. Analizar pricing.
7. Mejorar UX.
8. Añadir funcionalidades según demanda real.
9. Invitaciones de agentes.
10. FLUX como segundo proveedor.

No construir features grandes basándose únicamente en hipótesis.

---

# REGLA

No avanzar de fase si la fase anterior rompe:

- seguridad;
- datos;
- tests;
- arquitectura.
