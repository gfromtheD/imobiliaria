import type { Metadata } from "next";
import Link from "next/link";

import { OnboardingGuide } from "@/components/onboarding/onboarding-guide";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listProperties } from "@/services/properties";

export const metadata: Metadata = {
  title: "Propiedades",
};

export default async function PropertiesPage() {
  const properties = await listProperties();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propiedades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus inmuebles y genera imágenes decoradas con IA.
          </p>
        </div>
        <Link href="/properties/new">
          <Button>Crear propiedad</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="space-y-6">
          <OnboardingGuide />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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