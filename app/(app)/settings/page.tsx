import type { Metadata } from "next";

import { BillingSection } from "@/components/billing/billing-section";
import { SignOutButton } from "@/components/layout/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBillingData } from "@/services/billing";
import { getCurrentOrganization, getCurrentUser } from "@/services/organization";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const organization = await getCurrentOrganization();
  const { subscription, packages } = await getBillingData();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu cuenta y tu organización.
        </p>
      </div>

      <BillingSection
        creditsAvailable={subscription?.credits_available ?? organization?.creditsAvailable ?? 0}
        creditsReserved={subscription?.credits_reserved ?? 0}
        plan={subscription?.plan ?? organization?.subscriptionPlan ?? "free"}
        status={subscription?.status ?? "active"}
        hasCustomer={Boolean(subscription?.stripe_customer_id)}
        packages={packages}
      />

      <Card>
        <CardHeader>
          <CardTitle>Organización</CardTitle>
          <CardDescription>Datos de tu agencia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Nombre:</span> {organization?.name}
          </p>
          <p>
            <span className="font-medium">Plan:</span>{" "}
            {organization?.subscriptionPlan ?? "—"}
          </p>
          <p>
            <span className="font-medium">Créditos disponibles:</span>{" "}
            {organization?.creditsAvailable ?? "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
          <CardDescription>Tu acceso al producto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Rol:</span> {user?.role}
            </p>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}