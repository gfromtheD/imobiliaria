import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, EditPencil, MapPin } from "iconoir-react";

import { DeletePropertyButton } from "@/components/properties/delete-property-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProperty } from "@/services/properties";
import { listRooms } from "@/services/rooms";

export const metadata: Metadata = {
  title: "Propiedad",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getProperty(propertyId);

  if (!property) {
    notFound();
  }

  const rooms = await listRooms(propertyId);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link href="/properties" className="inline-flex">
        <Button variant="ghost" size="sm">
          <ProductIcon icon={ArrowLeft} className="size-4" />
          Todas las propiedades
        </Button>
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-7">
        <div className="max-w-2xl">
          <p className="text-label">Propiedad</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-title">
              {property.title}
            </h1>
            <Badge variant={property.status === "active" ? "default" : "secondary"}>
              {property.status === "active" ? "Activa" : "Archivada"}
            </Badge>
          </div>
          {property.address ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <ProductIcon icon={MapPin} className="size-4" />
              {property.address}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Dirección pendiente de añadir.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Creada el{" "}
            {new Date(property.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/properties/${property.id}/edit`}>
            <Button variant="outline" size="sm">
              <ProductIcon icon={EditPencil} className="size-3.5" />
              Editar
            </Button>
          </Link>
          <DeletePropertyButton
            propertyId={property.id}
            title={property.title}
          />
        </div>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Habitaciones</CardTitle>
            <CardDescription>
              {rooms.length === 0
                ? "Siguiente paso: añade una habitación con su fotografía original para poder decorarla con IA."
                : `${rooms.length} habitación${rooms.length === 1 ? "" : "es"} en esta propiedad.`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {rooms.length === 0 && (
              <Link href={`/properties/${propertyId}/rooms/new`}>
                <Button>Añadir primera habitación</Button>
              </Link>
            )}
            <Link href={`/properties/${propertyId}/rooms`}>
              <Button variant="outline">Ver habitaciones</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
