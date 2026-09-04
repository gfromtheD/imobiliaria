import "server-only";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY no está configurada en las variables de entorno.");
}

export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceEur: number;
  unitAmount: number; // en céntimos para Stripe (ej. 1900 = 19.00 EUR)
  description: string;
  badge?: string | null;
}

export const CREDIT_PACKAGES: readonly CreditPackage[] = [
  {
    id: "starter",
    name: "Pack Starter",
    credits: 10,
    priceEur: 19,
    unitAmount: 1900,
    description: "10 generaciones con IA de alta resolución.",
    badge: null,
  },
  {
    id: "pro",
    name: "Pack Pro",
    credits: 50,
    priceEur: 49,
    unitAmount: 4900,
    description: "50 generaciones para agencias activas.",
    badge: "Más popular",
  },
  {
    id: "agency",
    name: "Pack Agencia",
    credits: 100,
    priceEur: 89,
    unitAmount: 8900,
    description: "100 generaciones al mejor coste por imagen.",
    badge: "Mejor valor",
  },
] as const;

export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
}
