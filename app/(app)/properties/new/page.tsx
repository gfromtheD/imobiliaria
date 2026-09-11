import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "iconoir-react";

import { PropertyForm } from "@/components/properties/property-form";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";

export const metadata: Metadata = {
  title: "Nueva propiedad",
};

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href="/properties"><ProductIcon icon={ArrowLeft} className="size-4" />Propiedades</Link>
        </Button>
        <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">Nuevo inmueble</p>
        <h1 className="mt-3 text-title font-medium">Nueva propiedad</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Registra el inmueble que quieres decorar.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
