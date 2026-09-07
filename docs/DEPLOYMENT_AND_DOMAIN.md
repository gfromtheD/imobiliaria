# Guía de Despliegue, Staging y Configuración de Dominio

Este documento detalla los pasos exactos para desplegar la plataforma SaaS en Vercel (Staging / Producción), asociar el dominio personalizado con HTTPS y configurar los servicios externos (Supabase y Stripe).

---

## 1. Despliegue en Vercel

### Repositorio
* Conectar el repositorio de GitHub (`gfromtheD/imobiliaria`) a un nuevo proyecto en Vercel.
* **Framework Preset**: Next.js (detectado automáticamente).
* **Root Directory**: `./`
* **Node.js Version**: 20.x o superior.

### Variables de Entorno en Vercel (Staging y Production)

Configurar en el panel de Vercel (*Settings* > *Environment Variables*):

| Variable | Valor de ejemplo | Entornos |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://app.tu-dominio.com` (o la URL `*.vercel.app` de staging) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (Anon public key) | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (Service role key privada) | Production, Preview (solo Server Runtime) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (o `pk_live_...`) | Production, Preview |
| `STRIPE_SECRET_KEY` | `sk_test_...` (o `sk_live_...`) | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (generado tras registrar el webhook) | Production, Preview |

---

## 2. Configuración de Dominio y Certificados HTTPS

### Opción Recomendada: Subdominio de Aplicación (`app.tu-dominio.com`)

1. En el registrador DNS de tu dominio (Cloudflare, Namecheap, GoDaddy, Google Domains):
   * Añadir un registro **CNAME**:
     * **Host / Nombre**: `app` (o subdominio elegido)
     * **Valor / Destino**: `cname.vercel-dns.com`
     * **TTL**: Automático o 300s.
2. En el panel de Vercel:
   * Ir a *Settings* > *Domains*.
   * Añadir `app.tu-dominio.com`.
   * Vercel verificará la propagación DNS y aprovisionará automáticamente el certificado SSL/TLS gratuito emitido por **Let's Encrypt** (renovación automática permanente).
3. Todas las peticiones HTTP se redirigen automáticamente a **HTTPS** en el Edge de Vercel.

---

## 3. Configuración de Supabase para el Dominio de Producción

1. **Authentication > URL Configuration**:
   * **Site URL**: `https://app.tu-dominio.com`
   * **Redirect URLs**:
     * `https://app.tu-dominio.com/**`
     * `https://app.tu-dominio.com/auth/callback`
     * `https://app.tu-dominio.com/login`
     * `https://app.tu-dominio.com/properties`
2. **Plantillas de Email de Supabase (Authentication > Email Templates)**:
   * **Confirm signup**: Asegurar que incluya el enlace de confirmación apuntando a `{{ .ConfirmationURL }}`.
   * **Reset password**: Asegurar que use `{{ .ConfirmationURL }}` que redirige a `/auth/callback?next=/settings`.

---

## 4. Configuración de Stripe Webhooks en Modo Alpha / Producción

1. En el Stripe Dashboard:
   * Ir a *Developers* > *Webhooks* > *Add destination*.
   * **Endpoint URL**: `https://app.tu-dominio.com/api/webhooks/stripe`
   * **Eventos a escuchar**:
     * `checkout.session.completed`
     * `invoice.payment_failed`
     * `customer.subscription.created`
     * `customer.subscription.updated`
     * `customer.subscription.deleted`
2. Copiar el **Signing secret** (`whsec_...`) y guardarlo en Vercel como `STRIPE_WEBHOOK_SECRET`.
