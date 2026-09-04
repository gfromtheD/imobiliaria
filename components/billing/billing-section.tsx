"use client";

import { useTransition, useState } from "react";
import { Check, CreditCard, Sparkles, ExternalLink, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreditPackage } from "@/lib/stripe";
import { createCreditCheckoutAction, createCustomerPortalAction } from "@/services/billing";

interface BillingSectionProps {
  creditsAvailable: number;
  creditsReserved: number;
  plan: string;
  status: string;
  hasCustomer: boolean;
  packages: readonly CreditPackage[];
}

export function BillingSection({
  creditsAvailable,
  creditsReserved,
  plan,
  status,
  hasCustomer,
  packages,
}: BillingSectionProps) {
  const [isCheckoutPending, startCheckoutTransition] = useTransition();
  const [isPortalPending, startPortalTransition] = useTransition();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBuyCredits = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setErrorMessage(null);
    startCheckoutTransition(async () => {
      try {
        const res = await createCreditCheckoutAction(pkgId);
        if (res?.url) {
          window.location.href = res.url;
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "No se pudo iniciar el proceso de pago.",
        );
      }
    });
  };

  const handleOpenPortal = () => {
    setErrorMessage(null);
    startPortalTransition(async () => {
      try {
        const res = await createCustomerPortalAction();
        if (res?.url) {
          window.location.href = res.url;
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "No se pudo abrir el portal de facturación.",
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Resumen de Balance y Plan */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-xl">Plan y Créditos</CardTitle>
            <CardDescription>
              Gestiona el balance de generaciones con IA de tu agencia.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={plan === "free" ? "secondary" : "default"}>
              Plan {plan.toUpperCase()}
            </Badge>
            <Badge variant={status === "active" ? "default" : "outline"}>
              {status === "active" ? "Activo" : status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Créditos disponibles</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {creditsAvailable}
              </span>
              <span className="text-xs text-muted-foreground">generaciones</span>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">En proceso / reservados</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {creditsReserved}
              </span>
              <span className="text-xs text-muted-foreground">en cola</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            variant="outline"
            onClick={handleOpenPortal}
            disabled={isPortalPending || isCheckoutPending || !hasCustomer}
            title={!hasCustomer ? "Disponible tras realizar la primera compra" : undefined}
          >
            {isPortalPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Gestionar facturación (Portal Stripe)
          </Button>
        </CardFooter>
      </Card>

      {/* Paquetes de Créditos */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Recargar Créditos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona un paquete para añadir créditos inmediatamente a tu cuenta mediante pago seguro con Stripe.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <Card
                key={pkg.id}
                className={`relative flex flex-col justify-between transition-shadow hover:shadow-md ${
                  pkg.badge ? "border-primary/50 shadow-xs" : ""
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-medium shadow-xs">
                      {pkg.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      {pkg.priceEur} €
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / pago único
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{pkg.credits} imágenes staged de alta definición</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Sin caducidad de créditos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Descargas PNG de alta resolución</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    className="w-full"
                    variant={pkg.badge ? "default" : "outline"}
                    disabled={isCheckoutPending || isPortalPending}
                    onClick={() => handleBuyCredits(pkg.id)}
                  >
                    {isCheckoutPending && isSelected ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando con Stripe...
                      </>
                    ) : (
                      `Comprar ${pkg.credits} créditos`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
