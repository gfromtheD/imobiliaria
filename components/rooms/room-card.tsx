import Link from "next/link";
import { Camera, NavArrowRight } from "iconoir-react";

import { ProductIcon } from "@/components/ui/product-icon";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/domain";

export function RoomCard({
  id,
  propertyId,
  roomType,
  hasImage,
  imageUrl,
  createdAt,
}: {
  id: string;
  propertyId: string;
  roomType: string;
  hasImage: boolean;
  imageUrl: string | null;
  createdAt: string;
}) {
  const roomLabel = ROOM_TYPE_LABELS[roomType as RoomType] ?? roomType;

  return (
    <article className="group/room h-full border border-border bg-card text-card-foreground transition-[border-color,background-color,box-shadow] duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] hover:border-foreground/35 hover:bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      <Link
        href={`/properties/${propertyId}/rooms/${id}`}
        aria-label={`Abrir habitación: ${roomLabel}`}
        className="block h-full outline-none"
      >
        <div className="relative aspect-[4/3] border-b border-border bg-muted">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col justify-between p-5 text-muted-foreground">
              <p className="text-[0.625rem] font-medium tracking-[0.14em] uppercase">
                Imagen original pendiente
              </p>
              <ProductIcon icon={Camera} className="ml-auto size-7 opacity-55" />
            </div>
          )}
        </div>

        <div className="flex min-h-36 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-heading font-medium">{roomLabel}</h2>
            <ProductIcon
              icon={NavArrowRight}
              className="mt-0.5 size-4 text-muted-foreground transition-transform duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] motion-safe:group-hover/room:translate-x-0.5"
            />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>{hasImage ? "Imagen original lista" : "Sin imagen"}</span>
            <span>
              {new Date(createdAt).toLocaleDateString("es-ES", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
