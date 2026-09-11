import Link from "next/link";
import { ArrowRight, HomeAlt } from "iconoir-react";

import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";

export function RoomsEmptyState({ propertyId }: { propertyId: string }) {
  return (
    <section className="border-y border-border py-14 sm:py-20">
      <div className="max-w-xl">
        <div className="flex size-11 items-center justify-center rounded-sm border border-border bg-muted">
          <ProductIcon icon={HomeAlt} className="size-5" />
        </div>
        <p className="mt-8 text-label">El material de esta propiedad</p>
        <h2 className="mt-3 text-title font-medium">
          Añade la primera habitación.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Crea una estancia y sube su fotografía original. Será el punto de
          partida para preparar una decoración.
        </p>
        <Button asChild className="mt-7">
          <Link href={`/properties/${propertyId}/rooms/new`}>
            Añadir habitación
            <ProductIcon icon={ArrowRight} className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
