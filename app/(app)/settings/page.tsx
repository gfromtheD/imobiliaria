import type { Metadata } from "next";

import { BillingSection } from "@/components/billing/billing-section";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { getBillingData } from "@/services/billing";
import { getCurrentOrganization, getCurrentUser } from "@/services/organization";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function SettingsPage() {
  const [user, organization, { subscription, packages }] = await Promise.all([
    getCurrentUser(),
    getCurrentOrganization(),
    getBillingData(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="border-b border-border pb-8">
        <p className="text-label">Espacio de trabajo</p>
        <h1 className="mt-3 text-title font-medium">Configuración</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Gestiona la cuenta, la organización y el uso de Ambivio.</p>
      </div>

      <BillingSection
        creditsAvailable={subscription?.credits_available ?? organization?.creditsAvailable ?? 0}
        creditsReserved={subscription?.credits_reserved ?? 0}
        plan={subscription?.plan ?? organization?.subscriptionPlan ?? "free"}
        status={subscription?.status ?? "active"}
        hasCustomer={Boolean(subscription?.stripe_customer_id)}
        packages={packages}
      />

      <section className="grid gap-10 border-y border-border py-8 md:grid-cols-2">
        <div>
          <p className="text-label">Organización</p>
          <h2 className="mt-3 text-heading font-medium">{organization?.name ?? "Tu organización"}</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
            <div className="flex items-center justify-between gap-4 py-3"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium capitalize">{organization?.subscriptionPlan ?? "—"}</dd></div>
            <div className="flex items-center justify-between gap-4 py-3"><dt className="text-muted-foreground">Créditos disponibles</dt><dd className="font-medium">{organization?.creditsAvailable ?? "—"}</dd></div>
          </dl>
        </div>
        <div className="md:border-l md:border-border md:pl-10">
          <p className="text-label">Cuenta</p>
          <h2 className="mt-3 text-heading font-medium">Tu acceso</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
            <div className="flex items-center justify-between gap-4 py-3"><dt className="text-muted-foreground">Email</dt><dd className="max-w-[14rem] truncate font-medium">{user?.email ?? "—"}</dd></div>
            <div className="flex items-center justify-between gap-4 py-3"><dt className="text-muted-foreground">Rol</dt><dd className="font-medium capitalize">{user?.role ?? "—"}</dd></div>
          </dl>
          <div className="mt-6"><SignOutButton /></div>
        </div>
      </section>
    </div>
  );
}
