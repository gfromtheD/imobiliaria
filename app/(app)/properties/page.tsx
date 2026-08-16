import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { listProperties } from "@/services/properties";

export const metadata: Metadata = {
  title: "Propiedades",
};

export default async function PropertiesPage() {
  const properties = await listProperties();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Propiedades</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tus inmuebles y genera imágenes decoradas con IA.
        </p>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="Aún no tienes propiedades"
          description="Cuando crees tu primera propiedad, podrás subir fotografías de sus habitaciones y generar imágenes decoradas."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
            >
              <h2 className="font-medium">{property.title}</h2>
              {property.address && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {property.address}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {property.status === "active" ? "Activa" : "Archivada"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}