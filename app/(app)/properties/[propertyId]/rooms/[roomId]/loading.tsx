import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-10" aria-busy="true" aria-label="Cargando habitación">
      <div className="border-b border-border pb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-4 h-11 w-64" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.45fr)]">
        <Skeleton className="aspect-[4/3]" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
