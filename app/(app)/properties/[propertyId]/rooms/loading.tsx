import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-10"
      aria-busy="true"
      aria-label="Cargando habitaciones"
    >
      <div className="border-b border-border pb-8">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-4 h-10 w-64" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  );
}
