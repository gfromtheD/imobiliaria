# SECURITY.md

## 1. Objetivo

Definir las reglas mínimas de seguridad obligatorias para lanzar el SaaS.

---

## 2. Principio

Seguridad razonable para un SaaS comercial.

No implementar seguridad empresarial innecesaria.

Sí implementar correctamente:

- autenticación;
- autorización;
- RLS;
- secrets;
- validación de archivos;
- signed URLs;
- rate limiting;
- logging;
- eliminación de datos.

---

## 3. Secrets

Nunca exponer en frontend:

- AI API keys;
- Stripe secret;
- Supabase service role key;
- secrets internos.

Utilizar environment variables.

---

## 4. Browser

El browser únicamente recibe credenciales públicas que puedan exponerse según la arquitectura de Supabase.

Todo secreto permanece server-side.

---

## 5. RLS

RLS es obligatorio para tablas multi-tenant.

Un usuario de Organization A no puede acceder a:

Organization B.

Incluso si conoce:

- UUID;
- URL;
- nombre;
- ID de propiedad.

---

## 6. Authorization

No confiar únicamente en:

- botones ocultos;
- middleware;
- client-side checks.

Cada operación sensible debe verificar autorización server-side y/o mediante RLS.

### Créditos

El control y decremento de créditos ocurre exclusivamente en el backend.

El frontend nunca:

- descuenta créditos;
- decide entitlement;
- autoriza generaciones.

Si un usuario manipula el frontend:

el backend debe rechazar la generación cuando no exista crédito.

---

## 7. Uploads

Validar:

- MIME;
- extensión;
- tamaño;
- formato;
- contenido cuando sea posible.

No aceptar URLs arbitrarias como fuente de imágenes durante el MVP.

---

## 8. Storage

Buckets privados.

Acceso mediante signed URLs cuando corresponda.

No exponer rutas internas de Storage innecesariamente.

---

## 9. Rate limiting

Aplicar límites a:

- login;
- generación;
- regeneración;
- endpoints sensibles.

Especialmente generación IA.

---

## 10. Abuse protection

Prevenir:

- generación infinita;
- spam;
- loops;
- requests automatizados;
- consumo accidental masivo.

---

## 11. Stripe

Los webhooks deben:

- verificar firma;
- ser idempotentes;
- no confiar en datos del cliente.

---

## 12. AI

Nunca permitir que un usuario controle directamente:

- provider;
- API key;
- parámetros internos peligrosos.

El backend controla el pipeline.

---

## 13. Logging

Registrar eventos útiles:

- authentication failures;
- generation failures;
- authorization failures;
- excessive generation;
- storage failures.

No registrar:

- API keys;
- passwords;
- datos personales innecesarios;
- secretos;
- información sensible en texto plano.

---

## 14. GDPR

El producto debe permitir:

- eliminación de cuenta;
- eliminación de propiedades;
- eliminación de imágenes;
- eliminación de resultados;
- mecanismos de retención.

---

## 15. Data deletion

Eliminar una propiedad debe tener una política clara sobre:

- rooms;
- original images;
- generated images;
- generations;
- usage metadata.

---

## 16. Error messages

No revelar información interna.

No mostrar:

- stack traces;
- secrets;
- nombres internos de infraestructura;
- API responses completas.

---

## 17. Dependencies

Mantener dependencias actualizadas razonablemente.

No añadir dependencias sin necesidad.

---

## 18. Security review

Antes de producción:

- comprobar RLS;
- comprobar secrets;
- comprobar uploads;
- comprobar Storage;
- comprobar Stripe webhooks;
- comprobar endpoints de generación;
- comprobar autorización.

---

## 19. Regla

Nunca sacrificar aislamiento multi-tenant para acelerar desarrollo.
