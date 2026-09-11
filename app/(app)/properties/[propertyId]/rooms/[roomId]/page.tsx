import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle } from "iconoir-react";

import { GenerationsSection } from "@/components/generations/generations-section";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { ROOM_TYPE_LABELS, type RoomType } from "@/lib/domain";
import {
  getSubscription,
  getStagedImageUrl,
  listGenerations,
  listStyles,
} from "@/services/generations";
import { getRoom, getRoomImageUrl } from "@/services/rooms";
import { getProperty } from "@/services/properties";

export const metadata: Metadata = {
  title: "Habitación",
};

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

  if (!room || !property || room.property_id !== propertyId) {
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

      {room.original_image_path && imageUrl ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.45fr)] xl:gap-10">
          <figure className="overflow-hidden border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Fotografía original: ${roomLabel}`}
              className="aspect-[4/3] size-full object-contain"
            />
          </figure>
          <aside className="flex flex-col border-t border-border pt-5 xl:border-t-0 xl:border-l xl:pl-8 xl:pt-1">
            <p className="text-label">Imagen original</p>
            <h2 className="mt-3 text-heading font-medium">Lista para trabajar</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Esta fotografía será la fuente de cada decoración generada para
              esta habitación.
            </p>
            <p className="mt-auto flex items-center gap-2 pt-7 text-xs text-muted-foreground">
              <ProductIcon icon={CheckCircle} className="size-4" />
              Imagen asociada a la habitación
            </p>
            {room.notes && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-label">Notas</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {room.notes}
                </p>
              </div>
            )}
          </aside>
        </section>
      ) : (
        <section className="border-y border-border py-12">
          <div className="max-w-xl">
            <div className="flex size-11 items-center justify-center rounded-sm border border-border bg-muted">
              <ProductIcon icon={Camera} className="size-5" />
            </div>
            <p className="mt-7 text-label">Imagen original pendiente</p>
            <h2 className="mt-3 text-heading font-medium">Esta habitación aún no puede decorarse.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              La generación necesita la fotografía original asociada a esta estancia.
            </p>
          </div>
        </section>
      )}

      <section className="border-t border-border pt-8">
        <p className="text-label">Siguiente paso</p>
        <div className="mt-4">
          <GenerationsSection
            roomId={room.id}
            hasImage={room.original_image_path !== null}
            originalImageUrl={imageUrl}
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
      </section>
    </div>
  );
}
