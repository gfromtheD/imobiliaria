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
- un worker simple en Supabase Edge Functions;
- scheduler de jobs mediante pg_cron (PostgreSQL).

No utilizar microservicios durante el MVP.

No utilizar Redis, BullMQ, Kafka ni colas externas durante el MVP.

---

## 3. Arquitectura general

Browser
↓
Next.js
↓
Supabase
├── Auth
├── PostgreSQL (jobs + pg_cron)
├── Storage
└── Edge Functions (worker)

Servicios externos:

Next.js
↓
pg_cron → process_jobs()
↓
Supabase Edge Functions (worker de IA)
↓
ImageGenerationService
↓
ProviderAdapter
├── OpenAIAdapter
└── FluxAdapter
(candidatos — decisión pendiente de validación)

Otros:

Stripe
Sentry
PostHog
Vercel

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
- scheduler (pg_cron).

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
→ validación (backend)
→ Supabase Storage SDK (subida directa desde el navegador)
→ bucket privado original-images
→ Room record.

Política de Storage por prefijo de ruta:

{organization_id}/{property_id}/{image_id}

RLS garantiza que un usuario solo pueda escribir en la carpeta de su organización.

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
→ Storage (staged-images)
→ generation completed
→ UsageService.

pg_cron ejecuta process_jobs() periódicamente.

process_jobs() selecciona jobs pendientes e invoca la Edge Function del worker (pg_net).

---

## 6. Jobs de IA

Una generación es un job.

La cola de jobs vive en la tabla de generaciones (PostgreSQL).

El worker se implementa como Supabase Edge Function.

pg_cron (extensión de PostgreSQL) ejecuta la función process_jobs():

- selecciona jobs pendientes;
- invoca la Edge Function del worker (mediante pg_net);
- la Edge Function reclamada jobs y los procesa.

Estados:

pending
processing
completed
failed
cancelled

Transiciones válidas:

pending
→ processing
→ completed

pending
→ processing
→ failed

pending
→ cancelled

El endpoint de creación no espera la generación.

Debe devolver rápidamente el job.

La UI consulta el estado mediante polling o mecanismo equivalente.

Campos de protección del job:

- locked_at: evita que otro proceso reclame el mismo job;
- retry_count: reintentos limitados y configurables;
- output determinista por job (la ruta de salida incluye el job_id);
- idempotencia: un job solo se procesa una vez.

Los reintentos no deben generar cargos duplicados.

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
SET status = 'processing',
    locked_at = now()
WHERE id = :jobId
AND status = 'pending'
RETURNING *;

Un UPDATE con condición de estado garantiza que solo un worker reclamará cada job.

### Rate limiting (PostgreSQL)

El rate limiting se implementa en PostgreSQL, sin Redis.

Límites a nivel de organización:

- generaciones simultáneas en processing;
- volumen de generaciones por período;
- consumo de créditos.

Los valores concretos deben mantenerse configurables.

No hardcodear límites de negocio en múltiples partes del código.

### Límite de concurrencia

Debe existir un límite máximo de jobs en processing por organización.

Si se supera, el job permanece pending para la siguiente pasada de process_jobs().

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
→ OpenAIAdapter
→ FluxAdapter

Candidatos; la decisión de proveedor principal queda pendiente de validación con credenciales reales.

---

## 11. Regla de arquitectura

No introducir:

- microservicios;
- GraphQL;
- tRPC;
- monorepo;
- sistemas de plugins;
- colas externas (Redis, BullMQ, Kafka, u otras);
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
