# BILLING.md

## 1. Objetivo

Definir cómo el producto controla suscripciones, créditos y consumo.

---

## 2. Proveedor

Stripe.

La aplicación no debe almacenar información de tarjeta.

Stripe es la autoridad para:

- customer;
- subscription;
- payment;
- invoice.

La aplicación mantiene el estado necesario para autorización de funcionalidades.

---

## 3. Modelo inicial

Modelo SaaS basado en suscripción.

### Créditos gratuitos (fase inicial)

Cada organización recibe 3 generaciones gratuitas al registrarse.

No se solicita tarjeta de crédito.

Flujo:

- la organización inicia con el estado free;
- el entitlement incluye los créditos gratuitos;
- el control y decremento de créditos ocurre exclusivamente en el backend;
- cuando los créditos gratuitos se agotan, se bloquea la creación de nuevas generaciones;
- el usuario ve el flujo de conversión a pago.

Los créditos gratuitos se modelan en la misma estructura de entitlements que los planes de pago.

No introducir lógica de créditos en componentes UI.

---

## 4. Modelo de pago futuro

El producto puede utilizar créditos incluidos en cada plan.

Ejemplo conceptual:

Plan Basic
→ X créditos/mes

Plan Pro
→ Y créditos/mes

Los valores definitivos de precio y créditos se validarán comercialmente.

---

## 5. Crédito

Un crédito representa una generación estándar.

No significa necesariamente un coste fijo universal.

El ledger registra el coste real estimado.

---

## 6. Entitlement

Antes de crear una generación:

1. identificar organization;
2. obtener subscription o estado free;
3. comprobar status;
4. comprobar credits;
5. autorizar o rechazar.

No iniciar generación si no existe entitlement válido.

### Reserva transaccional de créditos

El consumo es transaccional y atómico:

1. bloquear la fila de créditos (SELECT ... FOR UPDATE);
2. comprobar disponibilidad (credits_available);
3. reservar el crédito (credits_available → credits_reserved);
4. crear el job;
5. confirmar transacción (COMMIT).

Si la generación termina correctamente:

→ el crédito reservado queda consumido.

Si falla por error del proveedor:

→ devolver crédito (reserved → available).

Si el usuario cancela antes del procesamiento:

→ devolver crédito (reserved → available).

Los retries nunca duplican el consumo:

cada job reserva un único crédito.

El cálculo del consumo nunca depende del cliente.

---

## 7. Usage ledger

Cada consumo genera una entrada.

Debe permitir responder:

- cuánto generó una organización;
- cuánto nos costó;
- cuántos créditos gastó;
- cuántos fueron errores;
- cuántos fueron retries.

---

## 8. Errores

Si el proveedor falla:

No cobrar crédito al cliente.

Devolver el crédito reservado.

Esto aplica tanto a créditos gratuitos como de pago.

Registrar:

provider_error

Si el usuario cancela antes del procesamiento:

devolver el crédito reservado.

Registrar:

cancelled

Si una generación fue técnicamente exitosa y el usuario solicita regeneración:

la regeneración puede consumir crédito adicional según plan.

---

## 9. Stripe

Utilizar:

- Stripe Checkout;
- Stripe Billing;
- Stripe Webhooks.

Eventos relevantes:

- invoice.paid;
- invoice.payment_failed;
- customer.subscription.updated;
- customer.subscription.deleted.

---

## 10. Webhooks

Los webhooks deben:

- validar firma;
- ser idempotentes;
- actualizar subscription;
- no duplicar estados;
- registrar errores.

---

## 11. Estado de suscripción

Estados mínimos:

free
trialing
active
past_due
canceled
incomplete

free:

organización sin suscripción de pago que opera con créditos gratuitos.

La aplicación debe traducir el estado de Stripe a entitlement.

---

## 12. Billing y generación

No llamar a Stripe directamente desde componentes UI.

No implementar control de créditos en componentes UI.

Flujo:

UI
→ backend
→ entitlement
→ generation
→ usage ledger.

---

## 13. Pricing inicial

La hipótesis comercial inicial será aproximadamente:

29 €/mes como primer punto de prueba.

Podrá probarse posteriormente:

49 €/mes

El precio definitivo dependerá de:

- uso real;
- coste por generación;
- percepción de valor;
- retención;
- conversión.

El código no debe hardcodear el precio.

Stripe debe ser la fuente de configuración de precios.

---

## 14. Coste interno

El sistema debe registrar:

provider_cost_estimate.

Esto permitirá:

revenue
− AI cost
− infrastructure
− payment fees
=
gross contribution.

---

## 15. No hacer

No construir:

- pagos propios;
- gestión de tarjetas;
- facturación manual;
- sistema de invoices propio;
- lógica compleja de contabilidad.

---

## 16. Regla

Stripe gestiona el dinero.

Nuestra aplicación gestiona:

- acceso;
- consumo;
- entitlement;
- experiencia del usuario.
