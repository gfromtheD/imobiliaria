"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function PropertiesError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="No se pudieron cargar las propiedades"
      description="Comprueba tu conexión e inténtalo de nuevo."
      onRetry={reset}
    />
  );
}
