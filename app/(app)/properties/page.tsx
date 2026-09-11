import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "iconoir-react";

import { PropertiesEmptyState } from "@/components/properties/properties-empty-state";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { listProperties } from "@/services/properties";

export const metadata: Metadata = {
  title: "Propiedades",
};

export default async function PropertiesPage() {
  const properties = await listProperties();

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Cartera inmobiliaria
          </p>
          <h1 className="mt-3 text-title font-medium">Propiedades</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Organiza los inmuebles y prepara cada espacio a partir de sus
            fotografías originales.
          </p>
        </div>
        <Link href="/properties/new">
          <Button>
            <ProductIcon icon={Plus} className="size-4" />
            Crear propiedad
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <PropertiesEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              address={property.address}
              status={property.status}
              createdAt={property.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
