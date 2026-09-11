import Link from "next/link";
import { Building, MapPin, NavArrowRight } from "iconoir-react";

import { ProductIcon } from "@/components/ui/product-icon";

export function PropertyCard({
  id,
  title,
  address,
  status,
  createdAt,
}: {
  id: string;
  title: string;
  address: string | null;
  status: string;
  createdAt: string;
}) {
  return (
    <article className="group/property h-full border border-border bg-card text-card-foreground transition-[border-color,background-color,box-shadow] duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] hover:border-foreground/35 hover:bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      <Link
        href={`/properties/${id}`}
        aria-label={`Abrir propiedad: ${title}`}
        className="block h-full outline-none"
      >
        <div className="relative aspect-[4/3] border-b border-border bg-muted px-5 py-4">
          <p className="text-[0.625rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Sin fotografía de referencia
          </p>
          <ProductIcon
            icon={Building}
            className="absolute right-5 bottom-5 size-7 text-muted-foreground/55"
          />
        </div>

        <div className="flex min-h-38 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-heading font-medium">{title}</h2>
            <ProductIcon
              icon={NavArrowRight}
              className="mt-0.5 size-4 text-muted-foreground transition-transform duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] motion-safe:group-hover/property:translate-x-0.5"
            />
          </div>
          {address ? (
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <ProductIcon icon={MapPin} className="mt-0.5 size-3.5" />
              <span>{address}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Dirección pendiente</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>{status === "active" ? "Activa" : "Archivada"}</span>
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
