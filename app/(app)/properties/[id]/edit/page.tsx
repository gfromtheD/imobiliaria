import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PropertyForm } from "@/components/properties/property-form";
import { getProperty } from "@/services/properties";

export const metadata: Metadata = {
  title: "Editar propiedad",
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar propiedad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
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