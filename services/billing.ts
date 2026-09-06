"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { stripe, getCreditPackage, CREDIT_PACKAGES } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function createCreditCheckoutAction(packageId: string) {
  const pkg = getCreditPackage(packageId);
  if (!pkg) {
    throw new Error("Paquete de créditos inválido.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    throw new Error("Tu cuenta no pertenece a ninguna organización.");
  }

  const orgId = profile.organization_id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, plan, status")
    .eq("organization_id", orgId)
    .maybeSingle();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        organization_id: orgId,
        user_id: user.id,
      },
    });
    customerId = customer.id;

    const admin = createAdminClient();
    await admin
      .from("subscriptions")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("organization_id", orgId);
  }

  const origin = await getOrigin();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: pkg.name,
            description: pkg.description,
            tax_code: "txcd_10000000",
          },
          unit_amount: pkg.unitAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      organization_id: orgId,
      credits: pkg.credits.toString(),
      package_id: pkg.id,
      user_id: user.id,
    },
    success_url: `${origin}/settings?payment=success&credits=${pkg.credits}`,
    cancel_url: `${origin}/settings?payment=cancelled`,
  });

  return { url: session.url };
}

export async function createCustomerPortalAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    throw new Error("Tu cuenta no pertenece a ninguna organización.");
  }

  const orgId = profile.organization_id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("organization_id", orgId)
    .maybeSingle();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        organization_id: orgId,
        user_id: user.id,
      },
    });
    customerId = customer.id;

    const admin = createAdminClient();
    await admin
      .from("subscriptions")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("organization_id", orgId);
  }

  const origin = await getOrigin();

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings`,
  });

  return { url: portalSession.url };
}

export async function getBillingData() {
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("credits_available, credits_reserved, plan, status, stripe_customer_id")
    .maybeSingle();

  return {
    subscription,
    packages: CREDIT_PACKAGES,
  };
}
