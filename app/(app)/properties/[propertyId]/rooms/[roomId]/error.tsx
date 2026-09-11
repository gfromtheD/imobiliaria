"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function RoomDetailError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="No se pudo cargar esta habitación"
      description="La imagen original o su espacio de trabajo no están disponibles ahora mismo."
      onRetry={reset}
    />
  );
}
