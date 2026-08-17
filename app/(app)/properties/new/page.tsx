import type { Metadata } from "next";

import { PropertyForm } from "@/components/properties/property-form";

export const metadata: Metadata = {
  title: "Nueva propiedad",
};

export default function NewPropertyPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva propiedad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra el inmueble que quieres decorar.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}