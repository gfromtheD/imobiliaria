import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RoomUploadForm } from "@/components/rooms/room-upload-form";
import { getProperty } from "@/services/properties";

export const metadata: Metadata = {
  title: "Nueva habitación",
};

export default async function NewRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/properties/${id}/rooms`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {property.title} · Habitaciones
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Nueva habitación
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra la estancia y sube su fotografía vacía.
        </p>
      </div>
      <RoomUploadForm propertyId={id} />
    </div>
  );
}