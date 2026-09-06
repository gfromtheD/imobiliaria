import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Firma o webhook secret no configurado." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Firma inválida";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.organization_id;
        const creditsStr = session.metadata?.credits;

        if (orgId && creditsStr) {
          const credits = parseInt(creditsStr, 10);
          if (isNaN(credits) || credits <= 0) {
            console.error("Créditos inválidos en metadata:", creditsStr);
            return NextResponse.json(
              { error: "Cantidad de créditos inválida." },
              { status: 400 },
            );
          }

          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null;

          // Recarga atómica e idempotente
          // @ts-expect-error - RPC apply_credit_purchase declared in DB migration
          const { error } = await admin.rpc("apply_credit_purchase", {
            p_org_id: orgId,
            p_credits: credits,
            p_stripe_customer_id: customerId,
            p_plan: "basic",
            p_event_id: event.id,
          });

          if (error) {
            console.error("Error al aplicar recarga de créditos:", error);
            return NextResponse.json(
              { error: "Error en la base de datos al recargar créditos." },
              { status: 500 },
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null;

        if (customerId) {
          const invoiceSub = (
            invoice as unknown as {
              subscription?: string | { id: string } | null;
            }
          ).subscription;
          const subId =
            typeof invoiceSub === "string"
              ? invoiceSub
              : invoiceSub?.id ?? null;

          // @ts-expect-error - RPC sync_stripe_subscription declared in DB migration
          const { error } = await admin.rpc("sync_stripe_subscription", {
            p_stripe_customer_id: customerId,
            p_stripe_subscription_id: subId,
            p_status: "past_due",
            p_plan: "basic",
            p_period_start: null,
            p_period_end: null,
            p_credits_to_add: 0,
            p_event_id: event.id,
          });

          if (error) {
            console.error("Error sincronizando invoice.payment_failed:", error);
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        // @ts-expect-error - RPC sync_stripe_subscription declared in DB migration
        const { error } = await admin.rpc("sync_stripe_subscription", {
          p_stripe_customer_id: customerId,
          p_stripe_subscription_id: sub.id,
          p_status:
            sub.status === "active"
              ? "active"
              : sub.status === "canceled"
                ? "canceled"
                : "past_due",
          p_plan: "basic",
          p_period_start: (sub as unknown as { current_period_start?: number }).current_period_start
            ? new Date((sub as unknown as { current_period_start: number }).current_period_start * 1000).toISOString()
            : null,
          p_period_end: (sub as unknown as { current_period_end?: number }).current_period_end
            ? new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
            : null,
          p_credits_to_add: 0,
          p_event_id: event.id,
        });

        if (error) {
          console.error("Error sincronizando suscripción:", error);
        }
        break;
      }

      default:
        // Evento no manejado intencionalmente
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
