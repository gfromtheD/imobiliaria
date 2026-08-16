import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h2 className="text-lg font-semibold">No encontrado</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Esta página no existe o no tienes acceso a ella.
      </p>
      <Link href="/properties" className="text-sm font-medium underline">
        Volver a propiedades
      </Link>
    </div>
  );
}