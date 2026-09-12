import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "iconoir-react";

import { RoomCreateForm } from "@/components/rooms/room-create-form";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { getProperty } from "@/services/properties";

export const metadata: Metadata = {
  title: "Nueva habitación",
};

export default async function NewRoomPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getProperty(propertyId);

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link href={`/properties/${propertyId}/rooms`}>
            <ProductIcon icon={ArrowLeft} className="size-4" />
            {property.title}
          </Link>
        </Button>
        <p className="text-label">Nueva habitación</p>
        <h1 className="mt-3 text-title font-medium">Crea la habitación.</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Identifica la estancia. En el siguiente paso podrás añadir todas las
          fotografías originales que necesites.
        </p>
      </div>
      <RoomCreateForm propertyId={propertyId} />
    </div>
  );
}
