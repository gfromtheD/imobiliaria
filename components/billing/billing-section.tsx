"use client";

import { useState, useTransition } from "react";
import { Check, Coins, CreditCard, OpenNewWindow, RefreshDouble } from "iconoir-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import type { CreditPackage } from "@/lib/stripe";
import { createCreditCheckoutAction, createCustomerPortalAction } from "@/services/billing";

type Props = { creditsAvailable: number; creditsReserved: number; plan: string; status: string; hasCustomer: boolean; packages: readonly CreditPackage[] };

export function BillingSection({ creditsAvailable, creditsReserved, plan, status, hasCustomer, packages }: Props) {
  const [isCheckoutPending, startCheckout] = useTransition();
  const [isPortalPending, startPortal] = useTransition();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const openCheckout = (packageId: string) => {
    setSelectedPackageId(packageId); setErrorMessage(null);
    startCheckout(async () => { try { const result = await createCreditCheckoutAction(packageId); if (result?.url) window.location.href = result.url; } catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar el pago."); } });
  };
  const openPortal = () => {
    setErrorMessage(null);
    startPortal(async () => { try { const result = await createCustomerPortalAction(); if (result?.url) window.location.href = result.url; } catch (error) { setErrorMessage(error instanceof Error ? error.message : "No se pudo abrir el portal de facturación."); } });
  };
  const busy = isCheckoutPending || isPortalPending;
  return <section className="space-y-8" aria-labelledby="billing-title">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div><p className="text-label">Uso y facturación</p><h2 id="billing-title" className="mt-3 text-heading font-medium">Plan y créditos</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Consulta el saldo de la organización y añade créditos cuando los necesites.</p></div>
      <div className="flex items-center gap-2"><Badge variant={plan === "free" ? "secondary" : "default"} className="capitalize">{plan}</Badge><Badge variant={status === "active" ? "outline" : "destructive"} className="capitalize">{status === "active" ? "Activo" : status}</Badge></div>
    </div>
    {errorMessage && <p role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{errorMessage}</p>}
    <div className="grid divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div className="py-5 sm:pr-8"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"><ProductIcon icon={Coins} className="size-4" />Disponibles</div><p className="mt-4 text-4xl font-medium tracking-[-0.04em]">{creditsAvailable}</p><p className="mt-1 text-sm text-muted-foreground">generaciones listas para usar</p></div>
      <div className="py-5 sm:pl-8"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"><ProductIcon icon={CreditCard} className="size-4" />Reservados</div><p className="mt-4 text-4xl font-medium tracking-[-0.04em]">{creditsReserved}</p><p className="mt-1 text-sm text-muted-foreground">en generaciones en curso</p></div>
    </div>
    <div className="flex justify-start"><Button type="button" variant="outline" onClick={openPortal} disabled={busy || !hasCustomer} title={!hasCustomer ? "Disponible después de la primera compra" : undefined}><ProductIcon icon={isPortalPending ? RefreshDouble : OpenNewWindow} className={`size-4 ${isPortalPending ? "animate-spin motion-reduce:animate-none" : ""}`} />{isPortalPending ? "Abriendo portal…" : "Gestionar facturación"}</Button></div>
    <div className="border-t border-border pt-8"><p className="text-label">Recargar</p><h3 className="mt-3 text-heading font-medium">Paquetes de créditos</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Pago único mediante Stripe. Elige solamente entre los paquetes disponibles para tu cuenta.</p>
      <div className="mt-6 grid gap-x-8 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">{packages.map((pkg) => <article key={pkg.id} className="flex min-w-0 flex-col py-6 md:px-6 first:md:pl-0 last:md:pr-0"><div className="flex items-center justify-between gap-3"><h4 className="font-medium">{pkg.name}</h4>{pkg.badge && <Badge variant="secondary">{pkg.badge}</Badge>}</div><p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">{pkg.description}</p><p className="mt-6 text-3xl font-medium tracking-[-0.04em]">{pkg.priceEur} €</p><p className="mt-1 text-xs text-muted-foreground">pago único · {pkg.credits} créditos</p><div className="mt-6"><Button type="button" className="w-full" variant="outline" disabled={busy} onClick={() => openCheckout(pkg.id)}>{isCheckoutPending && selectedPackageId === pkg.id ? <><ProductIcon icon={RefreshDouble} className="size-4 animate-spin motion-reduce:animate-none" />Conectando…</> : <><ProductIcon icon={Check} className="size-4" />Comprar créditos</>}</Button></div></article>)}</div>
    </div>
  </section>;
}
