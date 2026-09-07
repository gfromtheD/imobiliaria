# ALPHA_SETUP_GUIDE.md

## Guía de Puesta en Marcha Alpha (Zero-Cost & Free Staging)

Esta guía documenta los pasos y configuraciones exactas para lanzar la versión **Alpha privada** utilizando exclusivamente infraestructura gratuita (Vercel `*.vercel.app`, modo Mock de IA, Stripe Test Mode y proveedores SMTP con capa gratuita). Cuando se disponga de las credenciales definitivas de producción, bastará con pegarlas sin modificar el código ni la arquitectura.

---

## 1. Despliegue Gratuito en Vercel (`*.vercel.app`)

Para desplegar la aplicación sin comprar ningún dominio:

1. Conectar el repositorio de GitHub (`gfromtheD/imobiliaria`) en el dashboard de [Vercel](https://vercel.com).
2. Asignar el nombre del proyecto (por ejemplo `imobiliaria-alpha`). La URL generada automáticamente por Vercel será:
   `https://imobiliaria-alpha.vercel.app`
3. Cargar las siguientes **Environment Variables** en Vercel (*Settings* > *Environment Variables*):

| Variable | Valor para Alpha Gratuito | Entornos |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://imobiliaria-alpha.vercel.app` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<tu-proyecto-supabase>.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copiar desde Supabase Dashboard > API Keys)* | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | *(copiar desde Supabase Dashboard > API Keys)* | Production, Preview |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` *(modo test actual)* | Production, Preview |
| `STRIPE_SECRET_KEY` | `sk_test_...` *(modo test actual)* | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` *(generado en Stripe Dashboard para vercel.app)* | Production, Preview |

---

## 2. Configuración de Supabase para Vercel (`*.vercel.app`)

En el panel de tu proyecto Supabase Cloud:

1. **Authentication > URL Configuration**:
   * **Site URL**:
     `https://imobiliaria-alpha.vercel.app`
   * **Redirect URLs**:
     * `https://imobiliaria-alpha.vercel.app/**`
     * `https://imobiliaria-alpha.vercel.app/auth/callback`
     * `https://*.vercel.app/**` *(permite que las URLs de previsualización de ramas también puedan autenticarse)*
     * `http://localhost:3000/**` *(para mantener la sincronización con el entorno local de desarrollo)*
2. **Auth Callback Route**:
   * La aplicación ya cuenta con `app/auth/callback/route.ts`, que recibe el parámetro `?code=...` que envía Supabase por correo (confirmación de registro o recuperación de contraseña) e intercambia automáticamente el código PKCE por una sesión activa de usuario.

---

## 3. Stripe: Checklist de Claves para Producción

La arquitectura de Stripe ya está implementada y validada al 100% con Checkout, Portal de Clientes, Webhook idempotente y recarga atómica en `usage_ledger`.

Para pasar de Test Mode a Producción en el futuro, las **únicas** acciones requeridas son:

1. En el Dashboard de Stripe, cambiar el selector a **Live Mode**.
2. Crear un nuevo webhook en *Developers > Webhooks*:
   * **URL**: `https://imobiliaria-alpha.vercel.app/api/webhooks/stripe` (o el dominio final).
   * **Eventos**: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. Reemplazar únicamente estas 3 variables en el panel de Vercel:
   * [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` -> Pegar `pk_live_...`
   * [ ] `STRIPE_SECRET_KEY` -> Pegar `sk_live_...`
   * [ ] `STRIPE_WEBHOOK_SECRET` -> Pegar `whsec_...`

*Nota: No se requiere ningún cambio de código ni migración de base de datos.*

---

## 4. IA: Modo Mock Activo (Coste Cero)

El sistema opera y permanecerá operando en modo simulación:

* **MockAdapter**: Implementado en `supabase/functions/_shared/mock_adapter.ts`. Genera imágenes PNG sintéticas válidas de forma determinista y sin consumir APIs externas.
* **Pipeline completo verificado**: Encola jobs, claim atómico, simulación, subida al bucket `staged-images`, deducción de créditos y registro de uso en `usage_ledger`.
* **Cuándo pasar a IA real**:
  * Solo cuando se decida el proveedor definitivo (OpenAI Images API o FLUX), bastará con:
    1. Guardar la clave (`OPENAI_API_KEY` o `FLUX_API_KEY`) como secret en Supabase / Vault.
    2. Cambiar la clave `provider` en la tabla `public.app_config` de `'mock'` al proveedor seleccionado.

---

## 5. Proveedores SMTP para Supabase Auth (Opciones Futuras)

En el entorno local de desarrollo los correos son capturados por Mailpit. Para el proyecto de Supabase en producción/alpha, se recomienda cualquiera de estos 3 proveedores (todos ofrecen un nivel inicial gratuito):

### Opción 1: Resend (Recomendada)
* **Plan gratuito**: 3.000 emails/mes, 100 emails/día.
* **Configuración en Supabase Cloud** (*Settings > Authentication > SMTP Settings*):
  * **Sender Email**: `soporte@tu-dominio.com` (o dominio verificado en Resend)
  * **Sender Name**: `Virtual Staging`
  * **Host**: `smtp.resend.com`
  * **Port**: `465` (SSL) o `587` (TLS)
  * **User**: `resend`
  * **Password**: `re_123456789...` *(API Key generada en Resend)*

### Opción 2: SendGrid
* **Plan gratuito**: 100 emails/día para siempre.
* **Configuración en Supabase Cloud**:
  * **Host**: `smtp.sendgrid.net`
  * **Port**: `587`
  * **User**: `apikey`
  * **Password**: *(API Key generada en SendGrid)*

### Opción 3: Postmark
* **Plan para pruebas**: Cuenta de desarrollo gratuita (100 emails para testing y onboarding).
* **Configuración en Supabase Cloud**:
  * **Host**: `smtp.postmarkapp.com`
  * **Port**: `587`
  * **User**: *(Server API Token)*
  * **Password**: *(Server API Token)*

---

## 6. Resumen de Apertura de la Alpha

```
[Repositorio en GitHub] 
       │
       ▼ (Despliegue automático)
[Vercel: *.vercel.app] ◄────► [Supabase Cloud: Auth + DB + Storage + Edge Functions]
       │                                     ▲
       ▼ (Modo Test)                         │ (Modo Mock sin coste)
[Stripe Test Mode]                 [MockAdapter IA (PNG sintético)]
```
Todo el software está listo para recibir los primeros usuarios alpha en circuito cerrado.
