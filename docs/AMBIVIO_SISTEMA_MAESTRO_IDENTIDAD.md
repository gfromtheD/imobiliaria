# AMBIVIO --- Sistema Maestro de Identidad y Dirección de Diseño

**Estado:** documento operativo de identidad para diseño e
implementación\
**Producto:** Ambivio --- SaaS B2B de virtual staging inmobiliario con
IA\
**Propósito del documento:** actuar como fuente de verdad para agentes
de diseño y desarrollo frontend al aplicar la identidad de Ambivio al
producto, landing y futuras piezas visuales.

> Este documento define dirección y reglas de identidad. No sustituye
> los contratos funcionales, de seguridad, datos, RLS, RPC, backend o
> arquitectura existentes. La identidad debe aplicarse sobre el producto
> real sin alterar comportamiento funcional ni autoridad backend salvo
> que una tarea lo autorice explícitamente.

------------------------------------------------------------------------

## 1. Idea central de marca

**Ambivio** parte de la idea de un cruce, una bifurcación o un punto
desde el que un mismo lugar puede proyectarse hacia diferentes
posibilidades.

La marca no debe representar la IA como protagonista. La tecnología es
el motor silencioso que permite mostrar posibilidades futuras a partir
de una realidad existente.

### Idea esencial

**Realidad como punto de partida → distintos futuros posibles →
inteligencia visual silenciosa.**

### Tagline

**Un espacio. Distintos futuros.**

### Principio de producto asociado

Ambivio no pretende inventar otra propiedad. Parte de una fotografía y
un espacio reales y hace visible una posibilidad comercial plausible de
ese mismo espacio.

------------------------------------------------------------------------

## 2. Posicionamiento y personalidad

Ambivio debe percibirse como:

-   profesional;
-   sereno;
-   preciso;
-   sofisticado sin ostentación;
-   contemporáneo;
-   visualmente culto;
-   tecnológico sin estética futurista;
-   útil antes que espectacular;
-   diseñado con atención al detalle;
-   fiable para profesionales inmobiliarios.

Debe evitar percibirse como:

-   un generador de IA genérico;
-   una herramienta de entretenimiento;
-   un producto Web3;
-   un dashboard SaaS construido con defaults sin criterio;
-   una marca excesivamente futurista;
-   una marca infantil, colorida o efectista;
-   una plataforma cuya identidad dependa de clichés de vivienda,
    muebles, chispas de IA o robots.

La sofisticación debe proceder principalmente de la composición,
tipografía, fotografía, espacio, geometría, comportamiento y calidad de
ejecución.

------------------------------------------------------------------------

## 3. Identidad verbal

La comunicación debe partir de tres territorios:

1.  **Realidad ampliada.**
2.  **Futuros posibles del espacio.**
3.  **Inteligencia visual silenciosa.**

La IA no debe dominar titulares ni convertirse automáticamente en
argumento de marca. Se explica cuando aporta información útil sobre el
producto.

### Tono

El lenguaje debe ser:

-   directo;
-   breve;
-   profesional;
-   claro;
-   seguro sin grandilocuencia;
-   visual y concreto;
-   orientado al trabajo inmobiliario real.

Evitar:

-   hipérboles de IA;
-   "revolucionario", "mágico", "el futuro ha llegado" y clichés
    equivalentes;
-   lenguaje excesivamente técnico de cara al cliente;
-   promesas visuales absolutas;
-   exceso de adjetivos;
-   tono juguetón o informal cuando comprometa la percepción
    profesional.

------------------------------------------------------------------------

## 4. Sistema cromático

### Dirección de marca actual

Ambivio utiliza deliberadamente un sistema **monocromático**:

-   blanco;
-   negro;
-   escala de grises.

La fotografía inmobiliaria aporta la mayor parte del color de la
experiencia.

Esta decisión permite:

-   diferenciarse del patrón dominante de SaaS basado en azul, teal,
    cyan y violeta;
-   dar protagonismo a las propiedades;
-   construir una interfaz más editorial y arquitectónica;
-   evitar que el color de marca compita con las imágenes generadas.

### Regla

No introducir un color de acento de marca por iniciativa propia. Si en
el futuro se considera necesario, deberá ser una decisión explícita de
identidad.

### Colores semánticos

Los colores funcionales para error, warning, success o información no
deben confundirse con la paleta de marca. Pueden existir por
accesibilidad y comprensión funcional, pero deben utilizarse de forma
contenida y sistemática.

No sacrificar accesibilidad o comprensión por mantener una pantalla
literalmente en blanco y negro.

------------------------------------------------------------------------

## 5. Tipografía

### Display / identidad

**Chillax**

Uso previsto:

-   wordmark;
-   grandes titulares;
-   mensajes de marca;
-   momentos editoriales;
-   elementos de alto carácter visual.

Chillax no debe convertirse automáticamente en la tipografía de todos
los controles del producto.

### UI / cuerpo

**Satoshi**

Uso previsto:

-   interfaz;
-   navegación;
-   botones;
-   formularios;
-   tablas;
-   metadatos;
-   textos funcionales;
-   párrafos;
-   labels;
-   estados;
-   información de producto.

### Principio

La jerarquía debe construirse con tamaño, peso, espaciado, contraste y
composición antes que introduciendo más familias tipográficas.

No incorporar una tercera familia salvo decisión posterior explícita.

### Activos tipográficos

Las fuentes proporcionadas por el propietario del proyecto deben
incorporarse correctamente al repositorio y servirse localmente cuando
corresponda. Antes de hacerlo:

-   inspeccionar los archivos disponibles;
-   conservar sus licencias;
-   evitar duplicados innecesarios;
-   utilizar formatos web adecuados;
-   configurar correctamente pesos y estilos;
-   evitar layout shift;
-   respetar la arquitectura de fuentes existente en Next.js.

No asumir nombres de archivo, pesos o formatos: inspeccionarlos primero.

------------------------------------------------------------------------

## 6. Wordmark

La dirección seleccionada es:

**ambivio**

Características:

-   minúsculas;
-   basado en Chillax;
-   monocromático;
-   tratamiento mínimo;
-   personalidad obtenida principalmente mediante proporción y kerning;
-   sin necesidad de introducir el isotipo dentro de las letras.

El wordmark puede convivir con el tagline:

**Un espacio. Distintos futuros.**

### Especificación de producción

El wordmark web es texto real en **Chillax Variable** (peso visual 500,
tracking `-0.07em`). No se entrega como contorno SVG: conserva renderizado
de alta calidad, accesibilidad, búsqueda y carga mediante la fuente local
ya versionada. No alterar sus letras, sustituirlo por otra familia ni aplicar
efectos. Su altura de referencia es la altura óptica del isotipo, no la caja
completa del SVG.

La implementación reutilizable es `components/brand/ambivio-mark.tsx`.
Ofrece `wordmark`, `symbol` y `lockup`; el tagline es una extensión editorial,
no parte inseparable del logotipo.

------------------------------------------------------------------------

## 7. Isotipo

### Concepto seleccionado

El isotipo representa un **cruce / bifurcación / convergencia entre
recorridos**.

La variante seleccionada tiene desarrollo horizontal y una construcción
geométrica simple. Puede interpretarse como recorridos que convergen o
como una dirección que se abre hacia diferentes caminos según el sentido
de lectura.

Esta ambigüedad es útil: el símbolo no pretende ser un diagrama literal,
sino expresar un punto de decisión y posibilidad.

### Relación con Ambivio

El símbolo conecta con:

-   el significado del nombre;
-   un espacio real como origen;
-   múltiples posibilidades;
-   transformación;
-   continuidad;
-   estructura.

Las formas rectas aportan estabilidad y estructura. Las transiciones
curvas aportan continuidad y transformación.

### Restricciones

El isotipo:

-   no debe representar literalmente una casa;
-   no debe representar un mueble;
-   no debe representar un robot o cerebro de IA;
-   no debe llenarse de efectos;
-   no debe depender de degradados;
-   debe funcionar en negro sobre blanco y blanco sobre negro;
-   debe sobrevivir a tamaños pequeños.

### Activo maestro y construcción

El master es `public/brand/ambivio-symbol.svg`. Es un SVG de 64 × 64 con
dos recorridos abiertos, stroke de 6 unidades, terminal cuadrado y una rama
común de `x=6` a `x=22`. Cada recorrido se abre con una curva continua hacia
`y=18` o `y=46` y termina en `x=58`. No contiene transformaciones, IDs,
scripts, raster ni metadatos de editor; usa `currentColor` para poder
invertirse sin duplicar geometría.

La lectura de izquierda a derecha expresa un origen común y dos futuros. De
derecha a izquierda expresa convergencia. No es una A, casa o flecha literal.
`app/icon.svg` y `app/apple-icon.tsx` repiten exactamente esta geometría sobre
blanco para los contextos de sistema que no heredan `currentColor`.

### Lockups, espacio y tamaños

- **Lockup horizontal principal:** isotipo a la izquierda, separación de
  `0.625em` y wordmark alineado a su centro óptico. Es el uso de shell y auth.
- **Isotipo:** navegación estrecha, favicon, app icon y contextos de menos de
  96 px de ancho.
- **Wordmark:** solo cuando el contexto ya identifica la marca y no hay espacio
  para el lockup; no sustituye al icono del navegador.
- **Tagline:** únicamente en composición editorial amplia; no se usa en
  sidebar, cabeceras, controles, favicon ni app icon.
- **Zona de protección:** dejar alrededor del lockup al menos el ancho de la
  rama común del símbolo (aprox. `0.5em` a su tamaño de uso). No encajonar el
  logo con bordes, fondos o texto ajeno dentro de esa zona.
- **Mínimos:** lockup 112 px de ancho, wordmark 72 px y símbolo 16 px. Por
  debajo, usar solo el símbolo a 16 px o más.

------------------------------------------------------------------------

## 8. Sistema gráfico

### Estado

Sistema operativo para producto y futuras piezas; la landing lo aplicará,
pero no necesita inventar una segunda identidad.

### Reglas de composición

-   función antes que ornamento;
-   geometría elemental;
-   retículas claras;
-   contraste;
-   jerarquía tipográfica;
-   espacio negativo consciente;
-   composiciones asimétricas pero equilibradas;
-   líneas de 1 px para separar áreas, conectar una relación o dar una
    referencia de lectura; nunca como confeti;
-   bloques y marcos rectos para contener tarea, dato o fotografía; el borde
    es estructura, no decoración;
-   recortes y máscaras solo para revelar, comparar o mantener el encuadre de
    una fotografía; no para convertir imágenes en formas decorativas;
-   fotografía como protagonista;
-   monocromía;
-   estructura arquitectónica y contemporánea.

### Uso correcto

La geometría puede:

-   organizar;
-   separar;
-   enmarcar;
-   señalar relaciones;
-   construir jerarquía;
-   generar ritmo;
-   acompañar transformaciones.

No debe añadirse simplemente para "decorar una pantalla Bauhaus".

### Retícula y espacio

Trabajar primero con una retícula de contenido y divisores. Una composición
puede ser asimétrica cuando esa asimetría prioriza una fotografía, un resultado
o una acción. El espacio negativo debe separar decisiones y permitir que la
imagen conserve protagonismo. No usar círculos, cuadrados, colores primarios
ni formas flotantes como atajo visual.

### Advertencia

No convertir "Bauhaus" en una receta superficial basada en círculos,
cuadrados y líneas colocados aleatoriamente. El valor está en la lógica
de composición, proporción, función y espacio.

------------------------------------------------------------------------

## 9. Dirección fotográfica

La fotografía es el principal material visual de Ambivio.

### Principio fundamental

**La fotografía original del cliente representa la realidad de
referencia.**

El virtual staging debe conservar, salvo necesidad explícita del
producto:

-   arquitectura;
-   geometría;
-   perspectiva;
-   proporciones;
-   aberturas;
-   elementos estructurales;
-   encuadre;
-   relación espacial.

La transformación se concentra principalmente en mobiliario, decoración
y tratamiento visual no estructural cuando sea apropiado.

### Criterios

Priorizar:

-   plausibilidad;
-   naturalidad;
-   credibilidad comercial;
-   integración realista del mobiliario;
-   coherencia lumínica;
-   fidelidad espacial.

Evitar:

-   aspecto de render;
-   HDR excesivo;
-   iluminación artificialmente perfecta;
-   espectacularización que comprometa credibilidad;
-   un "filtro Ambivio" universal aplicado a todas las propiedades.

Cada inmueble debe conservar su carácter.

### Original / resultado

Cuando se comparen fotografías:

-   preservar proporción;
-   preservar escala visual;
-   preservar encuadre;
-   facilitar una comparación directa;
-   evitar que la propia interfaz distorsione la percepción de la
    transformación.

La selección de imágenes de marketing puede priorizar los mejores
ejemplos, pero debe seguir transmitiendo resultados plausibles.

### Reglas operativas

- Mostrar originales y resultados con el mismo encuadre y una proporción
  estable; `object-fit: contain` en comparativas evita inventar un recorte.
- En producto, la foto es el color. Los overlays son negro o blanco con
  opacidad suficiente para legibilidad y solo contienen etiquetas o controles.
- En marketing, un titular no debe cubrir arquitectura, ventana, mobiliario o
  el punto comparativo; reservar una zona negativa real o crear un bloque
  estructural adyacente.
- No aplicar filtro de marca, gradiente ni corrección cromática global. Cada
  propiedad conserva luz, materialidad y carácter propios.

------------------------------------------------------------------------

## 10. Iconografía

### Sistema principal

**Iconoir**

Iconoir es la familia iconográfica principal de Ambivio.

Razones de selección:

-   construcción lineal y geométrica;
-   carácter técnico contenido;
-   lenguaje racional;
-   buena convivencia con Satoshi y Chillax;
-   personalidad suficiente para evitar el aspecto de SaaS genérico;
-   buena cobertura funcional;
-   integración React disponible;
-   licencia MIT según la investigación realizada.

### Reglas

-   priorizar outline;
-   uso monocromático por defecto;
-   mantener tamaños y stroke sistemáticos;
-   alinear ópticamente los iconos con texto y controles;
-   utilizar iconos para función e información, no como ornamentación;
-   no mezclar familias mientras Iconoir proporcione un equivalente
    funcional adecuado.

Si falta un concepto específico, primero buscar una solución
semánticamente correcta dentro de Iconoir. Solo después evaluar una
excepción.

### Implementación

Conviene que la aplicación disponga de una capa coherente de iconos o
convenciones centralizadas para evitar tamaños, strokes y usos
arbitrarios por pantalla.

No introducir Lucide, Heroicons u otra librería simplemente porque un
componente de terceros la utilice por defecto sin revisar antes la
coherencia con el sistema Ambivio.

------------------------------------------------------------------------

## 11. Motion y comportamiento visual

### Importancia

El motion es uno de los principales elementos de **calidad percibida y
expresión de marca** de Ambivio.

La simplicidad visual NO debe interpretarse como simplicidad de
ejecución.

Al trabajar con:

-   blanco y negro;
-   geometrías elementales;
-   tipografía contenida;
-   mucho espacio;
-   fotografía dominante;

una parte importante de la diferenciación debe aparecer en:

-   microinteracciones;
-   transiciones;
-   respuesta de componentes;
-   continuidad entre estados;
-   tratamiento de imágenes;
-   estados de generación;
-   pequeños detalles de comportamiento.

### Objetivo

No se busca que Ambivio tenga muchas animaciones.

Se busca que el usuario perciba que **cada interacción importante ha
sido diseñada**.

El movimiento debe sentirse:

-   preciso;
-   fluido;
-   deliberado;
-   contenido;
-   coherente;
-   físicamente comprensible;
-   de alta calidad.

### Principios

#### Continuidad espacial

Los elementos relacionados deben mantener una relación perceptible entre
estados. Evitar desapariciones y apariciones arbitrarias cuando pueda
comunicarse de dónde viene o hacia dónde va un elemento.

#### Respuesta inmediata

Botones, controles, fotografías, drag & drop y acciones deben responder
inmediatamente a la interacción aunque el proceso posterior tarde.

#### Jerarquía temporal

No animar todo simultáneamente. Las secuencias deben expresar jerarquía.

#### Transformación antes que sustitución

Cuando dos estados estén relacionados, estudiar:

-   transformación;
-   desplazamiento;
-   máscara;
-   escala;
-   revelado;
-   continuidad visual;

antes de recurrir automáticamente a un `fade in / fade out`.

#### Fotografía como material

Las fotografías permiten construir comportamientos propios:

-   reveal;
-   before/after;
-   máscaras;
-   expansiones;
-   transiciones entre original y resultado;
-   cambios de estado;
-   tratamiento del progreso.

Estas interacciones pueden convertirse en una firma de producto.

#### Generación con identidad propia

Los estados de procesamiento/generación no deberían resolverse
automáticamente con un spinner genérico. Debe estudiarse un
comportamiento específico, informativo y coherente con Ambivio.

#### Microinteracciones

Deben recibir atención explícita:

-   hover;
-   press;
-   focus;
-   selección;
-   drag & drop;
-   upload;
-   progreso;
-   success;
-   error;
-   tooltips;
-   dropdowns;
-   tabs;
-   modales;
-   paneles;
-   navegación;
-   cambios de estado.

#### Movimiento contenido

Evitar:

-   rebotes gratuitos;
-   elasticidad excesiva;
-   parallax gratuito;
-   efectos típicos de landing de IA;
-   animaciones que retrasen el trabajo;
-   movimiento puramente ornamental.

#### Sistema, no improvisación

Duraciones, easings, springs, desplazamientos y escalas deben terminar
convertidos en reglas/tokens reutilizables.

No decidir el comportamiento independientemente en cada componente.

#### Accesibilidad

Respetar `prefers-reduced-motion` y proporcionar un comportamiento
funcional equivalente.

### Instrucción explícita para agentes

> **No interpretar "minimalista" como autorización para implementar
> interacciones mínimas, genéricas o descuidadas.**

Antes de desarrollar o rediseñar una vista importante, identificar:

1.  estados;
2.  transiciones;
3.  acciones;
4.  feedback;
5.  microinteracciones;
6.  oportunidades de continuidad espacial;
7.  comportamiento de loading/progreso;
8.  comportamiento bajo reduced motion.

Cuando falte una especificación concreta, diseñar una solución coherente
con este sistema en lugar de aceptar automáticamente el default del
framework.

### Sistema cuantitativo

Los tokens residen en `app/globals.css`. Son pocos y cubren las interacciones
existentes: `--motion-duration-press: 120ms`, `--motion-duration-control:
160ms`, `--motion-duration-overlay: 180ms`, `--motion-duration-panel: 220ms`,
`--motion-duration-image: 260ms` y `--motion-duration-async: 1800ms`.

- **Press (120):** respuesta táctil y de botón; escala máxima `0.98`.
- **Control (160):** color, borde, foco y clip-path de una comparación.
- **Overlay (180):** select, diálogo y navegación contextual.
- **Panel (220):** transición ocasional de una sección, no navegación por
  teclado.
- **Imagen (260):** reveal o cambio visual de una fotografía cuando aporte
  continuidad; no usar para demorar una imagen disponible.
- **Async (1800):** única repetición continua actual, una línea geométrica de
  estado; no representa porcentaje ni progreso falso.

`--motion-ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) se usa para entrada,
feedback y controles. `--motion-ease-in-out` (`cubic-bezier(0.77, 0, 0.175,
1)`) se reserva para la pulsación continua de la línea async y transformaciones
visuales. No se usan rebotes ni `ease-in` para acciones UI.

### Reduced motion

Con `prefers-reduced-motion`, el producto conserva estados, foco, contraste y
feedback de color/borde, pero elimina traslados, escalas, zoom y repeticiones.
La línea de generación pasa a ser estática y visible; no hay spinner. Las
comparativas reaccionan de forma instantánea, por lo que teclado y pointer
siguen explicando el resultado sin animación. La regla global corta transiciones
y animaciones restantes de componentes de terceros para impedir movimiento
accidental.

------------------------------------------------------------------------

## 12. Aplicación al producto

### Flujo principal del producto

La experiencia gira alrededor de:

**Organización → propiedades → habitaciones/imágenes → configuración
mínima → generar → estado → resultado → descarga.**

Las propiedades son el centro de navegación.

### Principios de interfaz

-   simplicidad y pocos pasos;
-   fotografía protagonista;
-   estados visibles;
-   créditos visibles cuando sean relevantes;
-   errores comprensibles;
-   IA presente como capacidad, no como decoración;
-   responsive;
-   accesible;
-   jerarquía clara;
-   mínima fricción;
-   coherencia entre pantallas.

### Arquitectura visual

La identidad debe aplicarse sin romper la dirección técnica del
producto:

-   Server Components por defecto;
-   Client Components solo cuando sean necesarios;
-   reutilizar contratos backend existentes;
-   no confiar en UI para autorización;
-   respetar RLS, RPCs y capa server-side;
-   mantener multi-tenancy;
-   no modificar contratos funcionales solo para facilitar una decisión
    estética.

------------------------------------------------------------------------

## 13. Regla especial para el agente de diseño/frontend

El agente responsable de identidad visual debe trabajar como
**especialista de diseño aplicado**, no como sustituto del agente
responsable de funcionalidad.

Antes de modificar código:

1.  inspeccionar el estado real de `origin/main`;
2.  revisar componentes, layouts, estilos y dependencias actuales;
3.  identificar qué funcionalidad ya está validada;
4.  identificar los cambios puramente visuales;
5.  evitar reescribir lógica funcional que no sea necesaria;
6.  reutilizar componentes y contratos cuando sea razonable;
7.  planificar cambios pequeños y verificables;
8.  comprobar responsive, accesibilidad y regresiones.

### Separación de responsabilidades

**Agente funcional/técnico** - backend; - contratos; - datos; -
seguridad; - funcionalidades; - pruebas funcionales; - arquitectura.

**Agente de identidad/diseño** - sistema visual; - composición; -
tipografía; - iconografía; - estilos; - motion; - microinteracciones; -
aplicación de marca; - calidad percibida; - responsive visual; -
accesibilidad visual.

Cuando una mejora visual requiera modificar lógica funcional o
contratos, detener esa parte, explicar la dependencia y coordinarla
antes de cambiarla.

------------------------------------------------------------------------

## 14. Calidad esperada de implementación

Ambivio no debe terminar pareciendo un template de shadcn con un
logotipo colocado encima.

El uso de Next.js, Tailwind, shadcn/ui u otros componentes es
infraestructura, no identidad.

El agente debe evitar:

-   defaults visuales sin revisar;
-   radios, sombras, spacing o tipografía heredados sin criterio;
-   iconos inconsistentes;
-   motion genérico;
-   exceso de cards dentro de cards;
-   gradientes "AI";
-   glow;
-   glassmorphism gratuito;
-   fondos decorativos futuristas;
-   saturación de badges;
-   layouts de dashboard genérico;
-   componentes visualmente distintos para la misma función.

La calidad debe surgir de un sistema consistente y de la ejecución de
los detalles.

------------------------------------------------------------------------

## 15. Metodología para aplicar la identidad

No realizar un "redesign total" de una sola vez.

Para cada área:

1.  inspeccionar;
2.  documentar brevemente el estado actual;
3.  identificar problemas respecto a este documento;
4.  proponer el alcance;
5.  implementar una superficie acotada;
6.  validar visual y funcionalmente;
7.  comprobar responsive;
8.  comprobar accesibilidad;
9.  comprobar regresiones;
10. continuar solo cuando la superficie anterior esté suficientemente
    estable.

La identidad debe evolucionar al entrar en contacto con pantallas
reales. Si una regla provisional no funciona en producto, documentar el
conflicto antes de modificar el sistema maestro.

------------------------------------------------------------------------

## 16. Prioridad inicial de aplicación

Orden recomendado:

1.  **Foundation visual**

    -   fuentes;
    -   tokens;
    -   colores;
    -   tipografía;
    -   spacing;
    -   radios/bordes/sombras si existen;
    -   iconografía;
    -   primitives de motion.

2.  **Shell del producto**

    -   navegación;
    -   header/sidebar;
    -   estructura general;
    -   estados globales.

3.  **Propiedades**

    -   listado;
    -   cards;
    -   empty/loading/error;
    -   creación/edición.

4.  **Habitaciones e imágenes**

    -   galería;
    -   upload;
    -   selección;
    -   gestión de imágenes.

5.  **Generación**

    -   configuración;
    -   CTA;
    -   pending;
    -   processing;
    -   completed;
    -   failed.

6.  **Resultado**

    -   original/result;
    -   before/after;
    -   descarga;
    -   estados y acciones.

7.  **Créditos y elementos auxiliares.**

8.  **Landing y marketing**, reutilizando el lenguaje ya probado dentro
    del producto.

------------------------------------------------------------------------

## 17. Aplicaciones pendientes

Los activos de producto ya cerrados son isotipo vectorial, wordmark técnico,
lockup, icono del navegador/app, sistema gráfico y tokens de motion. Shell y
auth consumen el lockup principal. Quedan aplicaciones que por alcance aún no
se han diseñado:

### Landing

Pendiente de diseño/aplicación.

### Aplicaciones secundarias

Redes, documentos, banners y otras piezas pueden desarrollarse después
de validar producto y landing.

------------------------------------------------------------------------

## 18. Activos externos previstos

El propietario del proyecto proporcionará una carpeta local:

`C:\Users\gfrom\Downloads\tipografia`

Esta carpeta contendrá los archivos disponibles de **Chillax** y
**Satoshi**.

El agente deberá inspeccionarla antes de copiar nada y mover/copiar
únicamente los activos necesarios al lugar correcto del repositorio
conforme a su arquitectura.

Este documento maestro también puede proporcionarse inicialmente desde
Descargas. Una vez incorporado al repositorio, debe ubicarse en una ruta
de documentación coherente con la estructura existente y convertirse en
referencia versionada para futuras tareas de identidad.

No borrar los originales de Descargas salvo autorización explícita.
Preferir copiar al repositorio y verificar el resultado.

------------------------------------------------------------------------

## 19. Regla de autoridad del documento

Este archivo es la referencia principal para la **dirección de identidad
visual de Ambivio**, pero no invalida:

-   arquitectura técnica existente;
-   contratos backend;
-   seguridad;
-   RLS;
-   migraciones;
-   pruebas;
-   documentación técnica más específica.

Si existe conflicto:

1.  no improvisar;
2.  identificar qué reglas entran en conflicto;
3.  preservar funcionalidad y seguridad;
4.  informar del conflicto;
5.  proponer una solución;
6.  modificar la dirección visual solo con una razón explícita y
    documentada.

------------------------------------------------------------------------

## 20. Criterio final

Una implementación correcta de Ambivio no se evalúa por la cantidad de
elementos de marca visibles.

Debe sentirse:

**simple a primera vista, rigurosa al observarla y cuidada al
utilizarla.**

La fotografía muestra el espacio.\
La interfaz organiza el trabajo.\
El movimiento aporta continuidad y calidad.\
La identidad conecta la realidad con sus distintos futuros.
