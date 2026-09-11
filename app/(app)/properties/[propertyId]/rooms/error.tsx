"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function RoomsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="No se pudieron cargar las habitaciones"
      description="Comprueba tu conexión e inténtalo de nuevo."
      onRetry={reset}
    />
  );
}
