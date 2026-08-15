# DATABASE.md

## 1. Base de datos

PostgreSQL mediante Supabase.

---

## 2. Entidades principales

### organizations

Representa una inmobiliaria.

Campos conceptuales:

- id
- name
- created_at
- updated_at

---

### users

Usuario de aplicación.

Campos:

- id
- email
- organization_id
- role
- created_at

Roles iniciales:

- owner
- agent

La organización se crea automáticamente en el registro del primer usuario.

El primer usuario de una organización es owner.

La invitación de agentes es una funcionalidad posterior (post-MVP).

---

### properties

Propiedad inmobiliaria.

Campos conceptuales:

- id
- organization_id
- title
- address
- status
- created_at
- updated_at

---

### rooms

Fotografía/habitación asociada a una propiedad.

Campos:

- id
- organization_id
- property_id
- room_type
- original_image_path
- notes
- created_at

---

### styles

Catálogo de estilos.

Campos:

- id
- name
- description
- ai_preset
- active

---

### generations

Representa una generación.

Campos:

- id
- organization_id
- room_id
- style_id
- status
- provider
- provider_job_id
- output_image_path
- prompt_version
- parameters
- error_code
- locked_at
- retry_count
- created_at
- started_at
- completed_at

status:

- pending
- processing
- completed
- failed
- cancelled

locked_at:

marca el momento en que el job fue reclamado.

Evita que otro proceso reclame el mismo job.

retry_count:

contador de reintentos (límite configurable).

El output es determinista por job:

la ruta de salida incluye el job_id.

---

### subscriptions

Estado de billing.

Campos:

- id
- organization_id
- stripe_customer_id
- stripe_subscription_id
- plan
- status
- credits_available
- credits_reserved
- current_period_start
- current_period_end
- created_at
- updated_at

plan:

- free
- basic
- pro

Al registrarse, la organización recibe una fila de suscripción:

plan = free

credits_available = 3

credits_reserved = 0

Sin tarjeta ni cliente de Stripe hasta la conversión.

---

### usage_ledger

Registro financiero/técnico del consumo.

Campos:

- id
- organization_id
- generation_id
- credits_used
- provider_cost_estimate
- status
- reason
- created_at

Semántica:

status:

- billable: consumo cobrado o correspondiente al plan;
- free: consumo dentro de los créditos gratuitos;
- retry: reintento de un job;
- provider_error: fallo del proveedor (no descuenta créditos).

reason:

justificación adicional del asiento cuando sea necesaria.

Separar status y reason:

- status define la clase de consumo;
- reason documenta el motivo sin mezclarse con el estado.

---

## 3. Relaciones

organizations
→ users

organizations
→ properties

properties
→ rooms

rooms
→ generations

styles
→ generations

organizations
→ subscriptions

organizations
→ usage_ledger

generations
→ usage_ledger

---

## 4. organization_id

Las entidades que puedan afectar a la seguridad deben incluir organization_id directa o indirectamente.

La recomendación es incluirlo explícitamente en entidades críticas para simplificar RLS y evitar consultas inseguras.

---

## 5. RLS

RLS es obligatorio.

Las políticas deben garantizar que un usuario solamente pueda acceder a datos de su organización.

Nunca confiar únicamente en:

- filtros de frontend;
- URL;
- IDs proporcionados por el usuario;
- lógica de React;
- middleware.

La base de datos debe aplicar la última frontera.

---

## 6. Ownership

Ejemplo:

User A
→ Organization A
→ Property A
→ Room A
→ Generation A

User B
→ Organization B

User B no puede leer Property A aunque conozca su UUID.

---

## 7. Imágenes

No guardar binarios de imagen directamente en PostgreSQL.

Guardar:

- path;
- metadata;
- referencia.

Los archivos viven en Supabase Storage.

### Buckets

Buckets privados:

- original-images;
- staged-images.

### Rutas

Originales:

{organization_id}/{property_id}/{image_id}

Resultados:

{organization_id}/{property_id}/{image_id}/{job_id}

### Acceso

- signed URLs cortas para visualización;
- signed URLs de descarga con expiración mayor.

### Validación

Formato:

- JPEG;
- PNG.

Tamaño máximo:

10 MB.

Resolución máxima:

4096 × 4096.

Máximo:

20 imágenes por propiedad.

Una generación por job en el MVP.

Sin procesamiento batch.

La validación se realiza en backend, independientemente de la validación visual del frontend.

---

## 8. Estados

Generation status:

pending
processing
completed
failed
cancelled

Transiciones:

pending
→ processing
→ completed

pending
→ processing
→ failed

pending
→ cancelled

No utilizar strings arbitrarios desde múltiples partes del código.

Centralizar estados.

---

## 9. Integridad

Utilizar:

- foreign keys;
- unique constraints;
- not null;
- indexes;
- check constraints;

cuando corresponda.

### Reserva atómica de créditos

El consumo de créditos es transaccional y atómico:

BEGIN;

SELECT ... FOR UPDATE
FROM subscriptions
WHERE organization_id = :org;

Si credits_available = 0:

→ rechazar la generación (rollback).

UPDATE subscriptions
SET credits_available = credits_available - 1,
    credits_reserved = credits_reserved + 1
WHERE organization_id = :org;

Crear el job.

COMMIT;

Resultado al terminar la generación:

- completed → el crédito reservado queda consumido;
- error del proveedor → devolver crédito (reserved → available);
- cancelación antes del procesamiento → devolver crédito (reserved → available).

Este patrón evita:

- condiciones de carrera;
- sobreconsumo;
- doble consumo por retries.

El control de créditos nunca se implementa en el frontend.

### Límites configurables

Los límites (concurrencia de generaciones, volumen por período, créditos) deben mantenerse configurables.

No hardcodear límites de negocio en múltiples partes del código.

---

## 10. Índices iniciales

Preparar índices para:

- organization_id;
- property_id;
- room_id;
- generation status;
- generation status + locked_at (reclamación de jobs);
- created_at;
- Stripe IDs.

No crear índices indiscriminadamente.

---

## 11. Migraciones

Toda modificación de schema debe realizarse mediante migraciones.

Nunca modificar producción manualmente sin generar el cambio correspondiente.

---

## 12. Datos sensibles

No almacenar innecesariamente:

- API keys;
- secretos;
- datos personales excesivos;
- información de pago sensible.

Stripe maneja la información de pago.

---

## 13. Eliminación

Debe existir una estrategia para eliminar:

- propiedad;
- habitaciones;
- imágenes;
- generaciones;
- datos asociados.

Las operaciones de eliminación deben respetar integridad y privacidad.

Al eliminar una propiedad:

- eliminar las imágenes asociadas (originales y generadas) en Storage;
- eliminar generaciones y metadatos de uso asociados.

### Retención

Política provisional de MVP:

24 meses como retención inicial.

Es una política técnica provisional, no una afirmación jurídica definitiva.

Debe revisarse antes del despliegue comercial formal.

---

## 14. Regla

La base de datos representa las reglas reales del producto.

Si una regla importante únicamente existe en frontend, probablemente está mal situada.
