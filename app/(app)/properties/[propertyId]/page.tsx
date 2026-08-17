import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeletePropertyButton } from "@/components/properties/delete-property-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {property.title}
            </h1>
            <Badge variant={property.status === "active" ? "default" : "secondary"}>
              {property.status === "active" ? "Activa" : "Archivada"}
            </Badge>
          </div>
          {property.address && (
            <p className="mt-1 text-sm text-muted-foreground">
              {property.address}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
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
            <Button variant="outline">Editar</Button>
          </Link>
          <DeletePropertyButton
            propertyId={property.id}
            title={property.title}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Habitaciones</CardTitle>
            <CardDescription>
              {rooms.length === 0
                ? "Sube fotografías de las habitaciones vacías y decóralas con IA."
                : `${rooms.length} habitación${rooms.length === 1 ? "" : "es"} en esta propiedad.`}
            </CardDescription>
          </div>
          <Link href={`/properties/${propertyId}/rooms`}>
            <Button variant="outline">Ver habitaciones</Button>
          </Link>
        </CardHeader>
      </Card>
    </div>
  );
}