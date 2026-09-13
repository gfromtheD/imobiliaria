# Ambivio — Sistema visual de emails transaccionales

**Estado:** handoff visual y verbal para implementación posterior.

**Alcance inicial:** recuperación de contraseña.
**Fuera de alcance:** Supabase Auth, Resend, DNS, dominio/sender, variables,
URLs reales, entrega, seguridad de infraestructura e integración.

## 1. Principio

El email transaccional confirma una acción concreta de cuenta. Debe sentirse
sereno, preciso y profesional, como la superficie Auth de Ambivio, sin adoptar
el tono ni la densidad de una newsletter. La secuencia visual es invariable:

`marca → contexto → acción → información de seguridad → footer`

Solo hay una acción primaria. No hay fotografía, promociones, redes sociales,
badges de IA, gradientes, sombras decorativas ni bloques de contenido extra.

## 2. Marca reemplazable

El isotipo integrado en el producto debe considerarse **provisional** para
email. Esta especificación no crea, exporta ni incrusta derivados del SVG
actual.

La versión base del email muestra `ambivio` como texto HTML. Es el fallback
canónico cuando se bloquean imágenes o no hay soporte SVG. Un futuro logo
aprobado puede sustituirlo mediante una imagen raster alojada de forma fiable,
con estas condiciones:

- reservar exactamente una caja de `116 × 32 px`;
- usar `alt="Ambivio"`, `width="116"` y `height="32"`;
- no depender de SVG, `currentColor`, web fonts ni CSS de ocultación;
- si la imagen no carga, el email debe conservar la palabra `ambivio` como
  fallback visible o mediante alt legible;
- no cambiar ni la altura de cabecera ni los márgenes al sustituir el activo.

La marca se alinea a la izquierda y tiene 32 px de espacio libre superior e
inferior dentro del bloque de cabecera. No se usa tagline, isotipo aislado ni
favicon dentro de un email de Auth.

## 3. Layout y tokens compatibles con email

Usar tablas de presentación, estilos inline, atributos `width`, `bgcolor` y
`align` cuando aporten fallback. No usar JavaScript, CSS grid/flex, variables
CSS, fuentes remotas, animación, `backdrop-filter`, `color-mix` ni SVG inline.

| Elemento | Especificación desktop | Móvil (≤480 px) |
| --- | --- | --- |
| Lienzo | `#f4f4f2`, 100% ancho | Igual |
| Contenedor | 600 px máximo, `#ffffff`, borde `1 px #dededb` | 100% menos 24 px de margen exterior |
| Cabecera | 48 px horizontal, 40 px superior | 24 px horizontal, 32 px superior |
| Cuerpo | 48 px horizontal, 8 px inferior / 40 px superior | 24 px horizontal, 8 px inferior / 32 px superior |
| Footer | 48 px horizontal, 24 px inferior / 28 px superior | 24 px horizontal, 24 px inferior / 24 px superior |
| Divisor | 1 px `#dededb`, ancho completo del contenido | Igual |
| CTA | altura 48 px, ancho natural mínimo 208 px | 100% del contenido, altura 48 px |

### Color

| Uso | Valor |
| --- | --- |
| Fondo exterior | `#f4f4f2` |
| Fondo de contenido | `#ffffff` |
| Texto principal / CTA | `#1c1c1c` |
| Texto secundario | `#5c5c59` |
| Divisor / borde | `#dededb` |
| Texto de CTA | `#ffffff` |

La combinación CTA `#1c1c1c` sobre texto blanco y el texto principal sobre
blanco cumplen contraste alto. No introducir un color de acento por marca.

### Tipografía y fallback

No depender de Chillax ni Satoshi: no se asume que estén disponibles en el
cliente de correo. Usar una única pila segura:

`-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif`

- Marca textual: 27 px, `font-weight: 600`, `letter-spacing: -1 px`, color
  `#1c1c1c`.
- Contexto: 12 px, peso 600, mayúsculas, `letter-spacing: 1.4 px`.
- Título: 28 px / 34 px, peso 600. En móvil: 26 px / 32 px.
- Cuerpo: 16 px / 25 px, peso 400.
- Texto alternativo y footer: 13 px / 20 px.
- CTA: 16 px / 48 px, peso 600, texto centrado.

No justificar texto, no reducir contenido funcional por debajo de 13 px y no
usar texto sobre imágenes.

## 4. Recuperación de contraseña — copy definitivo

**Subject:** `Restablece tu contraseña de Ambivio`

**Preheader:** `Solicitaste restablecer la contraseña de tu cuenta.`

| Bloque | Copy |
| --- | --- |
| Contexto | `ÁREA PRIVADA` |
| Título | `Restablecer contraseña` |
| Cuerpo | `Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Ambivio.` |
| CTA | `Restablecer contraseña` |
| Alternativa CTA | `Si el botón no funciona, copia y pega este enlace en tu navegador:` seguido de `[AUTH_RESET_URL]` en texto completo y seleccionable. |
| Seguridad verbal | `Si no solicitaste este cambio, no necesitas hacer nada.` |
| Footer | `Ambivio` + `Este es un email transaccional relacionado con tu cuenta.` |

`[AUTH_RESET_URL]` es un placeholder semántico. El frente técnico debe
sustituirlo exclusivamente por la variable segura de URL que proporcione el
flujo Auth real. Esta especificación no prescribe sintaxis de Supabase ni una
URL, plazo de expiración, IP, dispositivo o ubicación.

El footer no lleva enlace de baja, redes sociales ni texto comercial. Un enlace
de ayuda solo se añadirá cuando exista un destino de soporte real y aprobado.

## 5. Estructura HTML de referencia

1. Tabla exterior de 100% sobre el color de lienzo.
2. Tabla interior `role="presentation"`, ancho 600 px y borde recto de 1 px.
3. Bloque de marca textual o logo raster futuro con fallback.
4. Divisor de 1 px.
5. Contexto, `h1` visual, párrafo y CTA como enlace HTML con aspecto de botón.
6. URL alternativa en texto visible, con `word-break: break-word`.
7. Divisor de 1 px.
8. Seguridad verbal y footer.

La acción se expresa con un `<a>` completo, no con un `<button>`, ni imagen
clicable. El CTA debe llevar siempre un texto comprensible fuera de contexto.

## 6. Responsive, imágenes y dark mode

### Responsive

- Diseñar primero a una sola columna para 320–390 px; no hay contenido crítico
  en dos columnas.
- Usar `width="100%"` en tablas y CTA; limitar el contenedor con `max-width`.
- El botón pasa a ocupar el 100% del ancho del contenido en móvil.
- El enlace alternativo se parte sin generar scroll horizontal.
- Mantener márgenes exteriores mínimos de 12 px y padding interior de 24 px.

### Imágenes bloqueadas

La versión base no necesita imagen para comprender la acción. Si una futura
implementación usa logo raster, su `alt` será `Ambivio` y la cabecera debe
conservar el wordmark textual como fallback. Nunca ocultar copy, CTA ni aviso
de seguridad detrás de una imagen.

### Dark mode y auto-inversión

Los clientes no ofrecen una interpretación uniforme: Gmail, Outlook y Apple
Mail pueden invertir o ajustar fondos y texto. Por eso el diseño se limita a
blanco, negro y grises de alto contraste; declara `bgcolor` además de `style`
y evita logos transparentes oscuros sobre fondo claro sin fallback.

No se promete paridad de píxel. La condición de aceptación es que el CTA,
título, enlace alternativo y copy permanezcan legibles si un cliente altera los
colores. No diseñar una segunda versión ni usar hacks de inversión de color.

## 7. Accesibilidad y lectura

- Orden de lectura: marca, contexto, título, cuerpo, CTA, URL alternativa,
  seguridad, footer.
- El título debe ser el único `h1` lógico de la plantilla; en HTML de email se
  permite estilizarlo inline.
- El CTA incluye `aria-label="Restablecer contraseña de Ambivio"` cuando el
  cliente lo conserve, pero el texto visible ya es suficiente por sí mismo.
- La alternativa de enlace debe estar en texto real, no en una imagen ni en
  texto oculto.
- Contraste alto, cuerpo de 16 px y área táctil de 48 px para la acción.
- El email es comprensible sin logo, imágenes, CSS de media query o soporte de
  fuente del sistema.

## 8. Estructura reutilizable para Auth

Mantener el mismo marco para confirmación de cuenta, magic link, cambio de
email e invitaciones reales que el producto incorpore después. Solo cambian
estas variables de contenido:

| Variable | Función |
| --- | --- |
| `[EMAIL_CONTEXT]` | Etiqueta funcional, por ejemplo `ÁREA PRIVADA` |
| `[EMAIL_TITLE]` | Acción o estado principal |
| `[EMAIL_BODY]` | Explicación breve y concreta |
| `[PRIMARY_CTA_LABEL]` | Acción en imperativo claro |
| `[AUTH_ACTION_URL]` | URL segura aportada por Auth |
| `[FALLBACK_INTRO]` | Introducción para el enlace alternativo |
| `[SECURITY_NOTICE]` | Nota verdadera y específica del flujo |

No reutilizar este patrón para campañas, producto, newsletter o contenido
promocional: esos casos necesitarán otra jerarquía y consentimiento.

## 9. Handoff técnico exacto

1. Implementar el HTML desde el prototipo estático, conservando tablas,
   `bgcolor`, estilos inline y una columna.
2. Sustituir solo `[AUTH_RESET_URL]` por la variable segura del flujo real.
3. Mantener literalmente el subject, preheader y copy salvo decisión editorial
   posterior.
4. Empezar con wordmark textual; si se aprueba un logo raster definitivo,
   insertarlo en la caja reservada `116 × 32 px` con el fallback indicado.
5. No añadir expiraciones, metadatos de sesión, soporte, enlaces ni remitente
   inexistentes.
6. Probar la plantilla técnica en los clientes objetivo antes de activar envío;
   este documento no sustituye esa validación.

## 10. Prototipo

El prototipo estático y no enviable está en
`docs/prototypes/ambivio-password-reset-email.html`. No conecta con servicios,
no contiene una URL real, no importa dependencias y existe exclusivamente para
validar composición y responsive antes de la implementación técnica.
