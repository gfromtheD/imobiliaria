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
- created_at
- started_at
- completed_at

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
- credits_limit
- credits_used
- current_period_start
- current_period_end
- created_at
- updated_at

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

Estados/reasons posibles:

- billable
- free
- retry
- provider_error

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

Los archivos viven en Storage.

---

## 8. Estados

Generation status:

pending
processing
succeeded
failed

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

---

## 10. Índices iniciales

Preparar índices para:

- organization_id;
- property_id;
- room_id;
- generation status;
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

---

## 14. Regla

La base de datos representa las reglas reales del producto.

Si una regla importante únicamente existe en frontend, probablemente está mal situada.
