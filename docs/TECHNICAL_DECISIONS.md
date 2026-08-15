# TECHNICAL_DECISIONS.md

Registro de decisiones técnicas del MVP.

Fecha de reconciliación: 2026-08-15

Fuente: investigación técnica del MVP + decisiones aprobadas por el propietario del proyecto.

## Estados de decisión

- **APPROVED**: decisión cerrada. Implementar sin reabrir el debate.
- **PROVISIONAL**: decisión adoptada temporalmente, sujeta a revisión o confirmación externa.
- **PENDING VALIDATION**: decisión abierta. No cerrar hasta validación con pruebas/credenciales reales.

Una decisión solo cambia de estado por orden explícita.

---

## 1. Procesamiento asíncrono

| Decisión | Estado |
|---|---|
| Jobs de IA almacenados en PostgreSQL (tabla `generations` = cola de jobs) | APPROVED |
| Scheduler principal: pg_cron (PostgreSQL) con función `process_jobs()` | APPROVED |
| Worker: Supabase Edge Function, invocada desde la base de datos (pg_net) | APPROVED |
| Reclamación atómica de jobs (UPDATE condicional por estado + locked_at) | APPROVED |
| Estados: pending, processing, completed, failed, cancelled | APPROVED |
| Retries limitados y configurables (retry_count), sin doble cargo | APPROVED |
| Sin Redis, BullMQ, Kafka, colas externas, worker Node separado ni microservicios | APPROVED |
| Vercel Cron descartado como mecanismo principal | APPROVED |
| Vercel permanece como entorno de despliegue de Next.js | APPROVED |

---

## 2. Storage

| Decisión | Estado |
|---|---|
| Supabase Storage con buckets privados: `original-images`, `staged-images` | APPROVED |
| Rutas: `{organization_id}/{property_id}/{image_id}` y `{organization_id}/{property_id}/{image_id}/{job_id}` | APPROVED |
| Subida directa desde el navegador con Supabase Storage SDK | APPROVED |
| Aislamiento multi-tenant mediante políticas RLS de Storage (prefijo de ruta) | APPROVED |
| Service role key nunca expuesta al navegador | APPROVED |
| Signed URLs cortas para visualización; expiración mayor para descarga | APPROVED |
| Validación de MIME y tamaño en backend | APPROVED |

---

## 3. Multi-tenancy

| Decisión | Estado |
|---|---|
| organization_id en todas las entidades pertenecientes a una organización | APPROVED |
| Aislamiento mediante PostgreSQL/RLS, no por filtros de frontend | APPROVED |
| Organización creada automáticamente en el registro; primer usuario owner | APPROVED |
| Una organización principal por usuario en el MVP | APPROVED |
| Invitaciones de agentes: fase posterior (post-MVP) | APPROVED |

---

## 4. Créditos

| Decisión | Estado |
|---|---|
| 3 generaciones gratuitas por organización, sin tarjeta | APPROVED |
| Control de créditos exclusivamente backend | APPROVED |
| Consumo transaccional y atómico (credits_available / credits_reserved) | APPROVED |
| Reserva al crear el job; consumo al completar | APPROVED |
| Devolución por error de proveedor o cancelación previa al procesamiento | APPROVED |
| Sin doble consumo por retries o concurrencia | APPROVED |
| Estado/plan `free` en subscriptions (free/basic/pro) | APPROVED |

---

## 5. Rate limiting

| Decisión | Estado |
|---|---|
| Rate limiting en PostgreSQL, sin Redis | APPROVED |
| Límites a nivel de organización: generaciones simultáneas, volumen, consumo de créditos | APPROVED |
| Valores configurables; no hardcodear límites de negocio | APPROVED |
| Valores concretos iniciales (números exactos) | PENDING VALIDATION |

---

## 6. IA

| Decisión | Estado |
|---|---|
| Arquitectura: ImageGenerationService → ProviderAdapter → OpenAIAdapter / FluxAdapter | APPROVED |
| El dominio nunca conoce la API concreta; la UI nunca llama al proveedor | APPROVED |
| Credenciales exclusivamente desde variables de entorno | APPROVED |
| Modo mock (MockAdapter) para desarrollo sin API keys | APPROVED |
| Sin sistema de plugins complejo | APPROVED |
| Proveedor principal (OpenAI GPT Image 2 vs FLUX) | PENDING VALIDATION |
| Modelo exacto | PENDING VALIDATION |
| Modo de edición/mask | PENDING VALIDATION |
| Configuración óptima del modelo | PENDING VALIDATION |
| Comparación de calidad entre proveedores | PENDING VALIDATION |

---

## 7. Imágenes

| Decisión | Estado |
|---|---|
| Formatos: JPEG, PNG | APPROVED |
| Tamaño máximo: 10 MB | APPROVED |
| Resolución máxima: 4096 × 4096 | APPROVED |
| Máximo 20 imágenes por propiedad | APPROVED |
| Una generación por job; sin batch en el MVP | APPROVED |
| Validación en backend, independiente del frontend | APPROVED |

---

## 8. Jobs

| Decisión | Estado |
|---|---|
| Máquina de estados: pending → processing → completed / failed; pending → cancelled | APPROVED |
| locked_at para reclamación exclusiva | APPROVED |
| Contador de retries con límite configurable | APPROVED |
| Idempotencia y protección contra procesamiento duplicado | APPROVED |
| Output determinista por job (ruta con job_id) | APPROVED |
| Retries sin cargos duplicados | APPROVED |

---

## 9. Privacidad y retención

| Decisión | Estado |
|---|---|
| Buckets privados | APPROVED |
| Eliminación de imágenes asociadas al eliminar una propiedad | APPROVED |
| Logs sin payloads sensibles; sin imágenes; sin información privada en analytics | APPROVED |
| Retención inicial: 24 meses (política técnica provisional de MVP, no afirmación jurídica) | PROVISIONAL |

---

## 10. Decisiones abiertas adicionales

- Plan de Vercel (Hobby vs Pro): PENDING VALIDATION.
- Idioma de la interfaz: PENDING VALIDATION.
- Precio y créditos por plan de pago: PENDING VALIDATION.
- Política RLS del catálogo `styles` (lectura para usuarios autenticados): PENDING VALIDATION.
- Semántica de borrado (físico vs lógico) y confirmación jurídica de retención: PENDING VALIDATION.

---

## 11. Regla

Ningún documento puede declarar como definitiva una decisión en estado PENDING VALIDATION.

Antes de implementar algo que dependa de una decisión PENDING VALIDATION:

consultar este registro y, si procede, esperar la validación.
