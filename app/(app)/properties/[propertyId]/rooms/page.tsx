import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "iconoir-react";

import { RoomCard } from "@/components/rooms/room-card";
import { RoomsEmptyState } from "@/components/rooms/rooms-empty-state";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { getProperty } from "@/services/properties";
import { getRoomImageSignedUrl, listRoomImages, listRooms } from "@/services/rooms";

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
  const roomsWithImages = await Promise.all(
    rooms.map(async (room) => {
      const images = await listRoomImages(room.id);
      const firstReady = images.find((image) => image.status === "ready");
      return {
        ...room,
        hasReadyImage: Boolean(firstReady),
        imageUrl: firstReady ? await getRoomImageSignedUrl(firstReady.id) : null,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="border-b border-border pb-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href={`/properties/${propertyId}`}>
            <ProductIcon icon={ArrowLeft} className="size-4" />
            {property.title}
          </Link>
        </Button>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-label">Material visual de la propiedad</p>
            <h1 className="mt-3 text-title font-medium">Habitaciones</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Cada estancia conserva su fotografía original como punto de
              partida para la decoración.
            </p>
          </div>
          <Button asChild>
            <Link href={`/properties/${propertyId}/rooms/new`}>
              <ProductIcon icon={Plus} className="size-4" />
              Añadir habitación
            </Link>
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <RoomsEmptyState propertyId={propertyId} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roomsWithImages.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              propertyId={propertyId}
              roomType={room.room_type}
              hasImage={room.hasReadyImage}
              imageUrl={room.imageUrl}
              createdAt={room.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
