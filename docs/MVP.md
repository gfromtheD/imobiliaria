# MVP.md

## 1. Objetivo

Construir la versión mínima comercialmente utilizable del producto.

El MVP debe permitir a una pequeña inmobiliaria completar el siguiente flujo:

Crear propiedad
→ subir fotografía
→ seleccionar estancia
→ seleccionar estilo
→ generar
→ revisar
→ regenerar si es necesario
→ descargar.

---

## 2. Funcionalidades obligatorias

### 2.1 Autenticación

Debe permitir:

- registro;
- login;
- logout;
- recuperación de contraseña;
- sesión persistente.

Proveedor:

Supabase Auth.

---

### 2.2 Organización

Cada cuenta pertenece a una inmobiliaria.

Modelo:

Organization
→ Users
→ Properties
→ Rooms
→ Generations
→ Usage.

La organización se crea automáticamente durante el registro.

El primer usuario de la organización es owner.

El MVP puede limitar cada usuario a una organización principal.

La invitación de agentes queda fuera del MVP inicial.

---

### 2.3 Propiedades

El usuario debe poder:

- crear propiedad;
- introducir nombre/título;
- introducir dirección opcional;
- visualizar propiedades;
- entrar en una propiedad;
- eliminar propiedad.

---

### 2.4 Habitaciones

Cada propiedad puede contener fotografías/habitaciones.

El usuario debe poder:

- crear habitación;
- seleccionar tipo;
- subir fotografía;
- visualizar fotografía original.

Tipos iniciales:

- salón;
- dormitorio;
- cocina;
- baño;
- comedor;
- despacho;
- terraza;
- exterior;
- otra.

---

### 2.5 Subida de imagen

La aplicación debe:

- aceptar únicamente formatos permitidos;
- validar MIME;
- validar tamaño;
- almacenar imagen original;
- asociarla a organization;
- asociarla a property;
- asociarla a room.

Las imágenes originales deben conservarse.

---

### 2.6 Estilos

El MVP debe tener un catálogo reducido.

Ejemplo:

- Moderno;
- Nórdico;
- Minimalista;
- Lujo.

Los estilos deben ser datos configurables y no lógica hardcodeada en múltiples componentes.

Cada estilo tendrá:

- id;
- nombre;
- descripción;
- configuración/preset de IA.

---

### 2.7 Generación

El usuario pulsa:

"Generar staging"

El sistema:

1. valida permisos;
2. valida que existe imagen;
3. valida estilo;
4. comprueba entitlement/uso;
5. crea generation;
6. devuelve el job;
7. procesa en background;
8. almacena resultado;
9. actualiza estado;
10. registra uso.

El procesamiento en background lo realiza el worker (Supabase Edge Functions).

pg_cron (PostgreSQL) ejecuta process_jobs() y activa el worker para procesar y reintentar jobs.

---

### 2.8 Estados de generación

Estados mínimos:

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

No deben existir estados ambiguos.

Los reintentos son limitados y no duplican consumo de créditos.

---

### 2.9 Resultado

Cuando finaliza:

- mostrar imagen generada;
- mantener imagen original;
- mostrar antes/después;
- permitir descargar;
- permitir regenerar.

---

### 2.10 Regeneración

Una regeneración crea un nuevo resultado.

No sobrescribir silenciosamente el resultado anterior.

Cada generación debe poder rastrearse.

---

### 2.11 Descarga

El usuario puede descargar la imagen generada.

Debe utilizarse acceso seguro mediante signed URLs cuando corresponda.

---

### 2.12 Uso

Cada generación debe quedar registrada.

Debe conocerse:

- organización;
- generación;
- créditos consumidos;
- coste estimado;
- proveedor;
- estado;
- si fue retry;
- si fue error del proveedor.

Los errores del proveedor no deben descontar créditos.

---

### 2.13 Créditos gratuitos

Cada organización recibe 3 generaciones gratuitas al registrarse.

No se solicita tarjeta de crédito.

Reglas:

- el decremento de créditos ocurre exclusivamente en el backend;
- al agotar los créditos gratuitos, se bloquea la creación de nuevas generaciones;
- el usuario ve un flujo de conversión a pago;
- la conversión a pago es una fase posterior (Fase 7).

---

## 3. Funcionalidades fuera del MVP

No incluir:

- CRM;
- publicación automática;
- app móvil;
- marketplace;
- API pública;
- edición manual avanzada;
- vídeo;
- 3D;
- realidad aumentada;
- integraciones con portales;
- sistema avanzado de equipos;
- invitaciones de agentes;
- white-label;
- multi-organización por usuario;
- múltiples proveedores seleccionables por cliente;
- dashboard empresarial avanzado.

---

## 4. UX mínima

Pantallas:

### Auth

/login
/register
/forgot-password

### Aplicación

/dashboard

/properties

/properties/[id]

/properties/[id]/rooms/[roomId]

/generations/[id]

### Billing

/billing

### Cuenta

/settings

El diseño puede simplificarse durante la primera versión siempre que el flujo principal sea claro.

---

## 5. Criterios de aceptación

El MVP no se considera funcional hasta que:

- un usuario puede registrarse;
- puede iniciar sesión;
- pertenece a una organización creada automáticamente;
- el primer usuario es owner;
- dispone de 3 generaciones gratuitas sin tarjeta;
- puede crear propiedad;
- puede crear habitación;
- puede subir fotografía;
- puede seleccionar estancia;
- puede seleccionar estilo;
- puede generar;
- puede ver estado;
- obtiene resultado;
- puede comparar;
- puede regenerar;
- puede descargar;
- los datos están aislados entre organizaciones;
- el consumo se registra;
- los errores se gestionan;
- al agotar los créditos gratuitos se bloquea la generación;
- el usuario es dirigido al flujo de conversión.

---

## 6. Criterio comercial

El MVP debe ser suficientemente bueno para entregarse a una inmobiliaria real.

No necesita:

- tener todas las funcionalidades;
- estar perfectamente optimizado;
- tener diseño definitivo;
- soportar miles de usuarios.

Sí necesita:

- funcionar;
- ser seguro en los aspectos esenciales;
- producir resultados;
- no perder datos;
- controlar costes;
- permitir medir uso.

---

## 7. Regla

La pregunta para cada nueva funcionalidad es:

> "¿Sin esto una inmobiliaria puede probar el producto y decidir si paga?"

Si la respuesta es sí:

NO es necesaria para el MVP.
