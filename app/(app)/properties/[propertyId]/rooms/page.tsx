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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const rooms = await listRooms(id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/properties/${id}`}
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
        <Link href={`/properties/${id}/rooms/new`}>
          <Button>Añadir habitación</Button>
        </Link>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          title="Aún no hay habitaciones"
          description="Añade la primera habitación con su fotografía para poder decorarla con IA."
          action={
            <Link href={`/properties/${id}/rooms/new`}>
              <Button>Añadir habitación</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              propertyId={id}
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