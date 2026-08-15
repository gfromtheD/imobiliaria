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

El producto puede utilizar créditos incluidos en cada plan.

Ejemplo conceptual:

Plan Basic
→ X créditos/mes

Plan Pro
→ Y créditos/mes

Los valores definitivos de precio y créditos se validarán comercialmente.

---

## 4. Crédito

Un crédito representa una generación estándar.

No significa necesariamente un coste fijo universal.

El ledger registra el coste real estimado.

---

## 5. Entitlement

Antes de crear una generación:

1. identificar organization;
2. obtener subscription;
3. comprobar status;
4. comprobar credits;
5. autorizar o rechazar.

No iniciar generación si no existe entitlement válido.

---

## 6. Usage ledger

Cada consumo genera una entrada.

Debe permitir responder:

- cuánto generó una organización;
- cuánto nos costó;
- cuántos créditos gastó;
- cuántos fueron errores;
- cuántos fueron retries.

---

## 7. Errores

Si el proveedor falla:

No cobrar crédito al cliente.

Registrar:

provider_error

Si una generación fue técnicamente exitosa y el usuario solicita regeneración:

la regeneración puede consumir crédito adicional según plan.

---

## 8. Stripe

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

## 9. Webhooks

Los webhooks deben:

- validar firma;
- ser idempotentes;
- actualizar subscription;
- no duplicar estados;
- registrar errores.

---

## 10. Estado de suscripción

Estados mínimos:

trialing
active
past_due
canceled
incomplete

La aplicación debe traducir el estado de Stripe a entitlement.

---

## 11. Billing y generación

No llamar a Stripe directamente desde componentes UI.

Flujo:

UI
→ backend
→ entitlement
→ generation
→ usage ledger.

---

## 12. Pricing inicial

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

## 13. Coste interno

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

## 14. No hacer

No construir:

- pagos propios;
- gestión de tarjetas;
- facturación manual;
- sistema de invoices propio;
- lógica compleja de contabilidad.

---

## 15. Regla

Stripe gestiona el dinero.

Nuestra aplicación gestiona:

- acceso;
- consumo;
- entitlement;
- experiencia del usuario.
