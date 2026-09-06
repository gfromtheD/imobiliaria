import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RoomCard } from "@/components/rooms/room-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProperty } from "@/services/properties";
import { listRooms } from "@/services/rooms";

export const metadata: Metadata = {
  title: "Habitaciones",
};

export default async function RoomsPage({
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/properties/${propertyId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← {property.title}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Habitaciones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sube las fotografías de las habitaciones vacías de esta propiedad.
          </p>
        </div>
        <Link href={`/properties/${propertyId}/rooms/new`}>
          <Button>Añadir habitación</Button>
        </Link>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          title="Aún no hay habitaciones"
          description="Paso 2: Sube la primera fotografía de una estancia vacía (salón, dormitorio, cocina...) para desbloquear la decoración con IA."
          action={
            <Link href={`/properties/${propertyId}/rooms/new`}>
              <Button size="lg">Subir primera habitación</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              propertyId={propertyId}
              roomType={room.room_type}
              hasImage={room.original_image_path !== null}
              createdAt={room.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}