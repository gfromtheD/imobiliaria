# ARCHITECTURE.md

## 1. Objetivo

Definir la arquitectura técnica oficial del producto.

Este documento es normativo.

Los agentes de programación NO deben modificar la arquitectura sin una decisión explícita.

---

## 2. Principio principal

Simplicidad primero.

El MVP utilizará:

- un único repositorio;
- una única aplicación Next.js;
- Supabase como backend principal;
- servicios externos mediante adaptadores;
- jobs de IA almacenados en PostgreSQL;
- un worker simple en Supabase Edge Functions.

No utilizar microservicios durante el MVP.

No utilizar Redis, BullMQ ni colas externas durante el MVP.

---

## 3. Arquitectura general

Browser
↓
Next.js
↓
Supabase
├── Auth
├── PostgreSQL
├── Storage
└── Edge Functions

Servicios externos:

Next.js
↓
Supabase Edge Functions (worker de IA)
↓
ImageGenerationService
↓
ProviderAdapter
├── OpenAI Images API (inicial)
└── FLUX (alternativa futura)

Otros:

Stripe
Sentry
PostHog
Vercel
Vercel Cron (trigger/retry de jobs)

---

## 4. Capas

### Presentation

Next.js App Router.

Responsabilidades:

- páginas;
- layouts;
- formularios;
- componentes;
- interacción;
- visualización.

No contiene lógica de negocio compleja.

---

### Application / Services

Contiene casos de uso.

Ejemplos:

- PropertyService;
- GenerationService;
- UsageService;
- BillingService;
- StorageService.

Aquí viven las reglas de negocio.

---

### Data

Responsabilidad:

- consultas;
- mutations;
- acceso a Supabase;
- repositorios si fueran necesarios.

---

### Providers

Responsabilidad:

integrar servicios externos.

Ejemplos:

- FluxProvider;
- OpenAIProvider;
- StripeProvider.

---

### Infrastructure

Responsabilidad:

- Supabase;
- storage;
- configuración;
- deployment;
- jobs;
- worker de IA (Edge Function);
- scheduler (Vercel Cron).

---

## 5. Flujo principal

### Crear propiedad

UI
→ PropertyService
→ Database
→ response
→ UI

---

### Subir imagen

UI
→ validación
→ StorageService
→ Supabase Storage
→ Room record.

---

### Generar staging

UI
→ GenerationService
→ entitlement check
→ create generation
→ pending

Worker (Supabase Edge Function)
→ claim job
→ processing
→ ImageGenerationService
→ ProviderAdapter
→ AI Provider
→ result
→ Storage
→ generation succeeded
→ UsageService.

Vercel Cron invoca al worker para procesar jobs pendientes y reintentar jobs fallidos recuperables.

---

## 6. Jobs de IA

Una generación es un job.

El job vive en la tabla de generaciones (PostgreSQL).

Un worker implementado como Supabase Edge Function procesa los jobs.

Vercel Cron activa el worker periódicamente y reintenta jobs pendientes o fallidos recuperables.

Estados:

pending
processing
succeeded
failed

El endpoint de creación no espera la generación.

Debe devolver rápidamente el job.

La UI consulta el estado mediante polling o mecanismo equivalente.

---

## 7. Concurrencia

El MVP no necesita un sistema de colas externo.

Se utilizará una cola simple basada en la tabla de generaciones.

El worker debe:

- encontrar jobs pendientes;
- evitar procesar dos veces el mismo job;
- marcar processing;
- ejecutar proveedor;
- actualizar resultado;
- gestionar errores.

La reclamación de un job debe ser atómica:

UPDATE generations
SET status = 'processing'
WHERE id = :jobId
AND status = 'pending'
RETURNING *;

Un UPDATE con condición de estado garantiza que solo un worker reclamará cada job.

Debe existir un límite de concurrencia por organización:

número máximo de generaciones en processing simultáneamente.

Si se supera, el job permanece pending para la siguiente pasada.

---

## 8. Idempotencia

Las operaciones críticas deben ser idempotentes cuando sea posible.

Especialmente:

- procesamiento de jobs;
- webhooks de Stripe;
- registro de uso.

Un mismo evento no debe crear accidentalmente múltiples cobros o consumos.

---

## 9. Multi-tenancy

Toda información comercial debe pertenecer a una organización.

Las entidades críticas tendrán organization_id cuando corresponda.

La base de datos utilizará RLS.

La seguridad no debe depender únicamente del frontend.

---

## 10. Provider abstraction

La aplicación nunca debe llamar directamente al SDK de un proveedor de IA desde componentes UI.

Debe existir:

ImageGenerationService

que utilice:

ProviderAdapter

Ejemplo:

ImageGenerationService
→ OpenAIAdapter (inicial)
→ FluxAdapter (futuro)

---

## 11. Regla de arquitectura

No introducir:

- microservicios;
- GraphQL;
- tRPC;
- monorepo;
- sistemas de plugins;
- colas externas (Redis, BullMQ, u otras);
- Kubernetes;
- arquitectura distribuida;

salvo que exista una necesidad demostrada.

---

## 12. Escalabilidad futura

La arquitectura debe permitir posteriormente:

- workers dedicados;
- cola externa;
- múltiples proveedores;
- storage externo;
- más infraestructura;
- más organizaciones.

Pero estas capacidades no deben construirse prematuramente.

---

## 13. Seguridad

La base de datos es una frontera de seguridad.

Aunque exista un bug en la UI, RLS debe impedir acceso cruzado entre organizaciones.

---

## 14. Principio de cambio

Toda decisión arquitectónica debe responder:

1. ¿Qué problema resuelve?
2. ¿Por qué el stack actual no puede resolverlo?
3. ¿Cuál es el coste de introducirla?
4. ¿Es necesaria ahora?

Si no existe una razón clara:

No introducirla.
