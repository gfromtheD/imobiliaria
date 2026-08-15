# AI.md

## 1. Objetivo

Definir cómo funciona la generación de virtual staging y cómo se integra la inteligencia artificial.

---

## 2. Candidatos de proveedor

La decisión del proveedor principal NO está cerrada.

Candidatos:

- OpenAI Images API (GPT Image 2);
- FLUX.

Ambos se integran mediante ProviderAdapter.

Las credenciales proceden exclusivamente de variables de entorno.

Nunca inventar o hardcodear API keys.

La ausencia de API keys NO bloquea el desarrollo del MVP (ver modo mock).

La decisión final se tomará comparando ambos candidatos con pruebas reales cuando existan credenciales.

---

## 3. Modo mock (desarrollo sin API keys)

Debe existir un modo de desarrollo/mock que permita probar:

- creación del job;
- procesamiento;
- estados;
- errores;
- almacenamiento;
- créditos;
- UI;

sin realizar una generación real.

Un MockAdapter implementa ProviderAdapter y devuelve resultados simulados.

Se activa mediante variable de entorno (configuración), nunca por código client.

---

## 4. Regla principal

La aplicación no debe quedar acoplada directamente a un proveedor.

Nunca:

UI
→ OpenAI SDK

ni:

UI
→ Flux SDK

La arquitectura correcta es:

UI
→ GenerationService
→ ImageGenerationService
→ ProviderAdapter
→ Provider.

---

## 5. Interface conceptual

La interfaz debe representar una intención de negocio.

Ejemplo:

generateVirtualStaging(
  inputImage,
  roomType,
  style,
  options
)

Debe devolver información suficiente para que la aplicación pueda continuar sin conocer la implementación concreta del proveedor.

Conceptualmente:

GenerationResult:

- status;
- provider;
- providerJobId;
- output;
- latency;
- metadata;
- error.

---

## 6. Adaptadores

Crear:

OpenAIAdapter

FluxAdapter

No crear un sistema de plugins complejo.

Implementar únicamente los adaptadores necesarios.

El Adapter traduce:

- imagen original;
- tipo de habitación;
- estilo;
- prompt;
- configuración;
- modelo;

al formato requerido por cada proveedor.

---

## 7. ImageGenerationService

Responsabilidades:

- recibir solicitud;
- validar contexto;
- preparar input;
- seleccionar provider;
- enviar job;
- procesar resultado;
- devolver resultado normalizado.

No debe:

- renderizar UI;
- gestionar sesiones;
- cobrar directamente;
- modificar componentes.

---

## 8. Pipeline

### Paso 1

Usuario sube imagen.

### Paso 2

La imagen se valida.

### Paso 3

Se guarda en Storage.

### Paso 4

Se crea generation:

pending

### Paso 5

pg_cron ejecuta process_jobs().

process_jobs() detecta jobs pendientes e invoca la Edge Function del worker (pg_net).

La Edge Function reclama el job de forma atómica.

### Paso 6

Se marca:

processing

### Paso 7

ImageGenerationService llama al proveedor.

### Paso 8

Proveedor devuelve imagen.

### Paso 9

Guardar imagen generada.

### Paso 10

Actualizar generation:

completed

### Paso 11

Registrar consumo.

### Paso 12

Frontend obtiene resultado.

---

## 9. Error

Si el proveedor falla:

generation → failed

Registrar:

- provider;
- error_code;
- error metadata segura;
- timestamp.

Si es recuperable:

retry (limitado, con locked_at y contador de reintentos).

Si no:

failed.

Los reintentos no generan cargos duplicados.

No existe failover automático entre proveedores durante el MVP.

---

## 10. Créditos

Una generación estándar representa una unidad de consumo.

No asumir que una generación siempre cuesta exactamente lo mismo en infraestructura.

Registrar:

- provider;
- model;
- estimated cost;
- credits.

### Reserva y consumo

El consumo de créditos es transaccional y atómico:

1. bloquear la fila de créditos (SELECT ... FOR UPDATE);
2. comprobar disponibilidad;
3. reservar el crédito (credits_available → credits_reserved);
4. crear el job;
5. confirmar transacción.

Si la generación termina correctamente:

→ crédito consumido.

Si falla por error del proveedor:

→ devolver crédito.

Si el usuario cancela antes del procesamiento:

→ devolver crédito.

Evitar cualquier doble consumo por retries o concurrencia.

---

## 11. Prompts

Los prompts deben estar centralizados.

No escribir prompts críticos dentro de componentes UI.

El sistema debe poder versionar prompts.

Ejemplo:

staging_prompt_v1

Si cambia el prompt:

incrementar versión.

---

## 12. Input

El sistema debe proporcionar al modelo información estructurada:

- tipo de estancia;
- estilo;
- objetivo;
- restricciones.

No depender de texto introducido arbitrariamente por usuarios durante el MVP.

---

## 13. Arquitectura visual

La IA debe intentar conservar:

- estructura;
- perspectiva;
- arquitectura;
- suelo;
- paredes;
- puertas;
- ventanas.

El staging añade:

- muebles;
- decoración;
- iluminación ambiental razonable;
- elementos decorativos.

---

## 14. Original vs generated

Siempre conservar ambas:

original
generated

Nunca destruir la original.

---

## 15. Asincronía

Toda generación debe tratarse como job.

La UI no debe bloquearse esperando la respuesta del modelo.

---

## 16. Polling / Realtime

El MVP puede utilizar polling.

Realtime puede utilizarse si resulta sencillo y estable.

No introducir infraestructura adicional solamente para evitar polling.

---

## 17. Rate limiting

Implementado en PostgreSQL (sin Redis).

Límite por organización de:

- generaciones simultáneas;
- volumen de generaciones;
- consumo de créditos.

Los valores concretos deben mantenerse configurables.

---

## 18. Cost control

Cada generación debe poder relacionarse con:

organization
→ generation
→ provider
→ estimated cost.

Esto permite conocer margen por cliente.

---

## 19. Cambio de proveedor

Cambiar proveedor no debe requerir modificar:

- UI;
- propiedades;
- habitaciones;
- billing;
- analytics.

Solo debería cambiar:

ProviderAdapter / configuración.

---

## 20. Decisiones abiertas

No cerrar definitivamente todavía:

- OpenAI vs FLUX como proveedor principal;
- modelo exacto;
- modo de edición/mask;
- configuración óptima del modelo;
- comparación de calidad entre proveedores.

Estas decisiones se resolverán mediante pruebas reales cuando estén disponibles las credenciales.

Registradas en TECHNICAL_DECISIONS.md como PENDING VALIDATION.

---

## 21. Regla

La IA es un servicio externo.

No construir la arquitectura alrededor de una API concreta.
