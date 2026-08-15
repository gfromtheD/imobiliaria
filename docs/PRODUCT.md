# PRODUCT.md

## Nombre provisional

Virtual Staging SaaS

> Nombre comercial definitivo pendiente de decisión.

---

## 1. Propósito del producto

Construir una aplicación web SaaS para pequeñas inmobiliarias de 1–10 agentes que permita transformar fotografías de viviendas vacías en fotografías visualmente amuebladas mediante inteligencia artificial.

El producto debe reducir el tiempo, coste y esfuerzo necesarios para preparar visualmente una propiedad para su publicación.

La experiencia principal debe ser extremadamente sencilla:

SUBIR → ELEGIR → GENERAR → REVISAR → DESCARGAR

El producto no pretende convertirse inicialmente en un CRM inmobiliario ni en una plataforma completa de marketing inmobiliario.

Su función principal es resolver una sola necesidad de forma excelente:

> Convertir una fotografía vacía de una vivienda en una imagen de virtual staging preparada para utilizarse comercialmente.

---

## 2. Cliente objetivo

### ICP inicial

Pequeñas inmobiliarias de aproximadamente 1–10 agentes.

Características:

- Gestionan varias propiedades.
- Publican viviendas en portales inmobiliarios.
- Necesitan material visual atractivo.
- No disponen necesariamente de un equipo interno de diseño.
- No quieren asumir el coste o logística del home staging físico para cada inmueble.
- Necesitan producir material rápidamente.
- Pueden valorar una herramienta SaaS sencilla y predecible.

El producto se diseña inicialmente para este perfil.

No debemos intentar satisfacer simultáneamente a:

- grandes inmobiliarias,
- particulares,
- promotores,
- fotógrafos,
- home stagers,
- property managers.

Estos segmentos podrán analizarse posteriormente.

---

## 3. Problema

Una inmobiliaria puede recibir una propiedad vacía o visualmente poco atractiva.

Para publicarla necesita fotografías que permitan al potencial comprador imaginar cómo sería el espacio amueblado.

Actualmente puede:

- publicar la vivienda vacía;
- contratar edición;
- contratar virtual staging;
- realizar staging físico;
- utilizar herramientas genéricas de generación de imágenes.

Todas estas alternativas presentan diferentes combinaciones de coste, tiempo, dificultad o calidad.

Nuestro producto elimina parte de esa fricción.

---

## 4. Solución

El usuario:

1. Inicia sesión.
2. Crea una propiedad.
3. Sube una fotografía.
4. Selecciona el tipo de estancia.
5. Selecciona un estilo.
6. Solicita generación.
7. Espera mientras el sistema procesa la imagen.
8. Revisa el resultado.
9. Puede regenerar.
10. Descarga la imagen final.

El sistema debe preservar en la medida de lo posible:

- arquitectura;
- perspectiva;
- proporciones;
- ventanas;
- puertas;
- paredes;
- suelo;
- distribución;
- elementos estructurales.

El mobiliario y decoración son los elementos que deben transformarse.

---

## 5. Resultado que buscamos

El usuario debe poder pasar de:

"tengo una foto vacía"

a:

"tengo una foto amueblada que puedo utilizar en mi anuncio".

El valor no está en mostrar una demo tecnológica.

El valor está en producir un activo comercial utilizable.

---

## 6. Principio de producto

El producto debe sentirse como una herramienta profesional, no como un laboratorio de IA.

El usuario no debería necesitar entender:

- modelos;
- prompts;
- parámetros;
- seeds;
- proveedores;
- APIs;
- pipelines.

El usuario debe seleccionar opciones comprensibles para una inmobiliaria.

---

## 7. MVP

El MVP incluye:

- autenticación;
- organizaciones;
- propiedades;
- habitaciones/fotografías;
- subida de imágenes;
- selección de estancia;
- selección de estilo;
- generación IA;
- estado de generación;
- resultado;
- comparación antes/después;
- regeneración;
- descarga;
- contabilización de uso;
- billing básico;
- analytics;
- observabilidad;
- seguridad básica.

---

## 8. Fuera del MVP

No construir inicialmente:

- CRM inmobiliario;
- publicación automática en portales;
- app móvil;
- tours 3D;
- realidad aumentada;
- vídeo IA;
- editor avanzado;
- marketplace;
- API pública;
- sistema empresarial complejo;
- integraciones con decenas de servicios;
- automatizaciones complejas;
- white-label;
- sistema avanzado de equipos;
- funcionalidades B2C.

---

## 9. Principio de alcance

Una funcionalidad debe entrar en el MVP únicamente si contribuye directamente a:

1. preparar una fotografía;
2. generar virtual staging;
3. revisar el resultado;
4. guardar el resultado;
5. descargarlo;
6. controlar el uso y coste.

Si una funcionalidad no contribuye directamente a uno de estos objetivos, debe considerarse fuera del MVP.

---

## 10. Métrica fundamental

La métrica principal del producto es:

> Número de propiedades reales procesadas y utilizadas comercialmente.

No queremos optimizar únicamente:

- registros;
- sesiones;
- generaciones;
- tiempo dentro de la aplicación.

Queremos comprobar que una inmobiliaria incorpora el producto a su trabajo real.

---

## 11. Validación comercial

El primer piloto debe buscar aproximadamente 5–10 pequeñas inmobiliarias.

Durante el piloto debemos medir:

- registro;
- propiedades creadas;
- imágenes subidas;
- generaciones;
- regeneraciones;
- imágenes descargadas;
- uso recurrente;
- conversión a pago.

La señal definitiva de validación es:

> una inmobiliaria utiliza el producto con propiedades reales y decide pagar para continuar.

---

## 12. Principios de UX

La interfaz debe ser:

- limpia;
- rápida;
- profesional;
- visual;
- evidente;
- poco técnica.

El usuario no debería preguntarse:

"¿Qué tengo que hacer ahora?"

Cada pantalla debe tener una acción principal clara.

---

## 13. Principios de negocio

El producto debe permitir:

- suscripciones;
- límites de uso;
- contabilización de generaciones;
- control de coste por organización;
- futuras variaciones de planes.

La economía del producto depende especialmente del coste variable de generación de imágenes.

Por ello el sistema debe registrar el consumo desde el primer día.

---

## 14. Futuro

Después de validar el núcleo se podrán estudiar:

- más estilos;
- generación de múltiples habitaciones;
- generación de textos inmobiliarios;
- branding;
- publicaciones;
- integraciones con portales;
- fotografía exterior;
- mejora de imágenes;
- eliminación de objetos;
- vídeo;
- paquetes para fotógrafos;
- herramientas para promotores;
- API.

Estas funcionalidades no deben condicionar la arquitectura del MVP salvo cuando prepararlas resulte prácticamente gratuito.

---

## 15. Regla fundamental

No construir una plataforma inmobiliaria.

Construir primero:

> una herramienta excelente para transformar fotografías inmobiliarias.
