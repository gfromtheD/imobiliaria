# AI.md

## 1. Objetivo

Definir cómo funciona la generación de virtual staging y cómo se integra la inteligencia artificial.

---

## 2. Proveedor inicial

OpenAI Images API (GPT Image 2).

Es el proveedor con el que se desarrolla el MVP.

---

## 3. Alternativa futura

FLUX.

Se contempla como segundo proveedor para fases posteriores del producto.

Un segundo proveedor no debe introducirse sin decisión explícita.

Cualquier cambio de proveedor debe respetar la capa de adaptadores.

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

OpenAIAdapter (inicial)

FluxAdapter (futuro)

No crear un sistema genérico de plugins.

Implementar únicamente los adaptadores necesarios.

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

Worker (Supabase Edge Function, invocado por Vercel Cron) obtiene job.

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

succeeded

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

retry.

Si no:

failed.

---

## 10. Créditos

Una generación estándar representa una unidad de consumo.

No asumir que una generación siempre cuesta exactamente lo mismo en infraestructura.

Registrar:

- provider;
- model;
- estimated cost;
- credits.

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

Debe existir límite por organización.

Evitar que:

- errores de UI;
- abuso;
- scripts;
- agentes automáticos;

generen miles de imágenes accidentalmente.

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

## 20. Regla

La IA es un servicio externo.

No construir la arquitectura alrededor de una API concreta.
