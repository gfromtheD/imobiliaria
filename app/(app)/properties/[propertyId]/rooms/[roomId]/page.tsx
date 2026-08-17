import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/domain";
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

      <Card>
        <CardHeader>
          <CardTitle>Decoración con IA</CardTitle>
          <CardDescription>
            Elige un estilo y genera una imagen decorada. Disponible en la
            siguiente fase.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}