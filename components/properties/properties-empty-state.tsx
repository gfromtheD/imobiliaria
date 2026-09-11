import Link from "next/link";
import { ArrowRight, Building } from "iconoir-react";

import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";

export function PropertiesEmptyState() {
  return (
    <section className="border-y border-border py-14 sm:py-20">
      <div className="max-w-xl">
        <div className="flex size-11 items-center justify-center rounded-sm border border-border bg-muted">
          <ProductIcon icon={Building} className="size-5" />
        </div>
        <p className="mt-8 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Tu cartera empieza aquí
        </p>
        <h2 className="mt-3 text-title font-medium">Añade tu primera propiedad.</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Registra el inmueble y después incorpora sus habitaciones con las
          fotografías originales de cada espacio.
        </p>
        <Button asChild className="mt-7">
          <Link href="/properties/new">
            Crear propiedad
            <ProductIcon icon={ArrowRight} className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
