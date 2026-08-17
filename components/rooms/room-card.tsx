import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/domain";

export function RoomCard({
  id,
  propertyId,
  roomType,
  hasImage,
  createdAt,
}: {
  id: string;
  propertyId: string;
  roomType: string;
  hasImage: boolean;
  createdAt: string;
}) {
  return (
    <Link
      href={`/properties/${propertyId}/rooms/${id}`}
      className="block rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-ring/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium">
          {ROOM_TYPE_LABELS[roomType as RoomType] ?? roomType}
        </h2>
        <Badge variant={hasImage ? "default" : "secondary"}>
          {hasImage ? "Con imagen" : "Sin imagen"}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Creada el{" "}
        {new Date(createdAt).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}