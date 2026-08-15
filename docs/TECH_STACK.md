# TECH_STACK.md

## Stack oficial del MVP

Este documento define las tecnologías permitidas y recomendadas.

Los agentes no deben sustituirlas por alternativas sin justificación explícita.

---

## Frontend

### Next.js

Versión objetivo:

Next.js 16

Utilizar:

- App Router;
- Server Components;
- Route Handlers;
- Server Actions cuando sean apropiadas.

---

### React

React 19.

---

### TypeScript

TypeScript obligatorio.

No utilizar JavaScript para código nuevo salvo casos excepcionales justificados.

---

### Styling

Tailwind CSS v4.

---

### Components

shadcn/ui.

Los componentes deben ser componibles y mantenerse simples.

---

## Backend

Next.js full-stack + Supabase.

No crear un backend Node/Python separado para el MVP.

Worker de IA:

Supabase Edge Functions.

Job trigger/retry:

Vercel Cron.

No utilizar Redis, BullMQ ni colas externas para el MVP.

---

## Database

PostgreSQL gestionado mediante Supabase.

---

## Authentication

Supabase Auth.

Inicialmente:

- email;
- password;
- recuperación de contraseña.

OAuth puede añadirse posteriormente.

---

## Storage

Supabase Storage.

Buckets privados.

Signed URLs para acceso cuando corresponda.

---

## AI

Proveedor inicial:

OpenAI Images API (GPT Image 2).

Alternativa futura:

FLUX.

La aplicación utilizará ImageGenerationService.

La UI nunca llamará directamente al proveedor.

Los proveedores se integran mediante ProviderAdapter.

---

## Payments

Stripe.

Utilizar:

- Stripe Checkout;
- Stripe Billing;
- webhooks;
- usage tracking cuando sea necesario.

No construir billing propio.

---

## Hosting

Vercel para Next.js.

Vercel Cron para el trigger/retry de jobs de generación.

Supabase para:

- database;
- auth;
- storage;
- edge functions (worker de IA).

---

## Monitoring

Sentry.

---

## Product analytics

PostHog.

---

## Traffic/performance

Vercel Analytics.

---

## Testing

Unit/integration:

Vitest o Jest.

E2E:

Playwright.

La decisión concreta debe mantenerse consistente en todo el repositorio.

Preferencia inicial:

Vitest + Playwright.

---

## CI/CD

GitHub Actions.

Cada Pull Request debe ejecutar como mínimo:

- lint;
- typecheck;
- tests.

---

## Package manager

Usar un único package manager en todo el proyecto.

Preferencia:

pnpm.

No mezclar npm/yarn/pnpm.

---

## Environment variables

Variables sensibles únicamente en servidor.

Nunca introducir:

- API keys;
- Stripe secret;
- service role keys;

en componentes client.

---

## Dependencias

No añadir una dependencia simplemente porque sea popular.

Antes de instalar una nueva dependencia:

1. comprobar si Next.js la resuelve;
2. comprobar si Supabase la resuelve;
3. comprobar si existe una solución nativa;
4. evaluar mantenimiento;
5. evaluar necesidad.

---

## Versionado

Las versiones exactas instaladas en package.json son la autoridad final.

Este documento define la dirección tecnológica, no sustituye package.json.

---

## Regla fundamental

El stack debe permanecer pequeño.

Tecnología adicional requiere una razón.
