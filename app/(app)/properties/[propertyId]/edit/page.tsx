import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "iconoir-react";

import { PropertyForm } from "@/components/properties/property-form";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { getProperty } from "@/services/properties";

export const metadata: Metadata = {
  title: "Editar propiedad",
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getProperty(propertyId);

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href={`/properties/${property.id}`}><ProductIcon icon={ArrowLeft} className="size-4" />Volver a la propiedad</Link>
        </Button>
        <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">Datos del inmueble</p>
        <h1 className="mt-3 text-title font-medium">Editar propiedad</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Actualiza los datos del inmueble.
        </p>
      </div>
      <PropertyForm
        propertyId={property.id}
        initialTitle={property.title}
        initialAddress={property.address ?? ""}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
