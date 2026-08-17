import Link from "next/link";

import { Badge } from "@/components/ui/badge";

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
    <Link
      href={`/properties/${id}`}
      className="block rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-ring/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium">{title}</h2>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? "Activa" : "Archivada"}
        </Badge>
      </div>
      {address && (
        <p className="mt-1 text-sm text-muted-foreground">{address}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Creada el{" "}
        {new Date(createdAt).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}