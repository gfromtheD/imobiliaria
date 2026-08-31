import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GenerationsSection } from "@/components/generations/generations-section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/domain";
import {
  getSubscription,
  getStagedImageUrl,
  listGenerations,
  listStyles,
} from "@/services/generations";
import { getRoom, getRoomImageUrl } from "@/services/rooms";

export const metadata: Metadata = {
  title: "Habitación",
};

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string; roomId: string }>;
}) {
  const { propertyId, roomId } = await params;
  const room = await getRoom(roomId);

  if (!room || room.property_id !== propertyId) {
    notFound();
  }

  const imageUrl = await getRoomImageUrl(room.id);

  const [styles, subscription, generations] = await Promise.all([
    listStyles(),
    getSubscription(),
    listGenerations(roomId),
  ]);

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

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/properties/${propertyId}/rooms`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Habitaciones
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {ROOM_TYPE_LABELS[room.room_type as RoomType] ?? room.room_type}
          </h1>
          <Badge variant={room.original_image_path ? "default" : "secondary"}>
            {room.original_image_path ? "Con imagen" : "Sin imagen"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Creada el{" "}
          {new Date(room.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {room.original_image_path && imageUrl ? (
        <Card>
          <CardContent className="p-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Fotografía original de la ${ROOM_TYPE_LABELS[room.room_type as RoomType] ?? room.room_type}`}
              className="w-full rounded-lg object-cover"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin fotografía</CardTitle>
            <CardDescription>
              La fotografía original no está disponible para esta habitación.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {room.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
            <CardDescription>{room.notes}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <GenerationsSection
        roomId={room.id}
        hasImage={room.original_image_path !== null}
        styles={styles}
        credits={
          subscription
            ? {
                creditsAvailable: subscription.credits_available,
                creditsReserved: subscription.credits_reserved,
              }
            : null
        }
        generations={generationViews}
      />
    </div>
  );
}