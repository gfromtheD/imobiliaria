import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "iconoir-react";

import { RoomImageWorkspace } from "@/components/rooms/room-image-workspace";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/domain";
import {
  getStagedImageUrl,
  getSubscription,
  listGenerations,
  listStyles,
} from "@/services/generations";
import { getProperty } from "@/services/properties";
import {
  getRoom,
  getRoomImageSignedUrl,
  listRoomImages,
} from "@/services/rooms";

export const metadata: Metadata = { title: "Habitación" };

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string; roomId: string }>;
}) {
  const { propertyId, roomId } = await params;
  const [room, property] = await Promise.all([
    getRoom(roomId),
    getProperty(propertyId),
  ]);

  if (!room || !property || room.property_id !== propertyId) notFound();

  const [images, styles, subscription, generations] = await Promise.all([
    listRoomImages(roomId),
    listStyles(),
    getSubscription(),
    listGenerations(roomId),
  ]);

  const imageViews = await Promise.all(
    images.map(async (image) => ({
      id: image.id,
      status: image.status as "pending" | "ready" | "deleting",
      storagePath: image.storage_path,
      createdAt: image.created_at,
      signedUrl:
        image.status === "ready" ? await getRoomImageSignedUrl(image.id) : null,
    })),
  );

  const generationViews = await Promise.all(
    generations.map(async (generation) => ({
      id: generation.id,
      styleId: generation.style_id,
      status: generation.status,
      outputImageUrl:
        generation.status === "completed" && generation.output_image_path
          ? await getStagedImageUrl(generation.output_image_path)
          : null,
      errorMessage: generation.error_message,
      retryCount: generation.retry_count,
      createdAt: generation.created_at,
      completedAt: generation.completed_at,
    })),
  );

  const roomLabel = ROOM_TYPE_LABELS[room.room_type as RoomType] ?? room.room_type;

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="border-b border-border pb-8">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href={`/properties/${propertyId}/rooms`}>
            <ProductIcon icon={ArrowLeft} className="size-4" />
            {property.title}
          </Link>
        </Button>
        <p className="text-label">Habitación</p>
        <h1 className="mt-3 text-title font-medium">{roomLabel}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Creada el {new Date(room.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <RoomImageWorkspace
        propertyId={propertyId}
        roomId={room.id}
        roomType={room.room_type}
        notes={room.notes}
        images={imageViews}
        styles={styles}
        credits={subscription ? { creditsAvailable: subscription.credits_available, creditsReserved: subscription.credits_reserved } : null}
        generations={generationViews}
      />
    </div>
  );
}
