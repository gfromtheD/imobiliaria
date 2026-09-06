"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Download,
  X,
  Clock,
  Filter,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { BeforeAfterSlider } from "@/components/generations/before-after-slider";
import {
  GENERATION_STATUS_LABELS,
  ROOM_TYPE_LABELS,
  type GenerationStatus,
  type RoomType,
} from "@/lib/domain";
import type { AllGenerationsItem } from "@/services/generations";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "default" as const;
    case "failed":
      return "destructive" as const;
    case "processing":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function GenerationsHistoryView({
  initialGenerations,
}: {
  initialGenerations: AllGenerationsItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [activeComparison, setActiveComparison] = useState<AllGenerationsItem | null>(null);

  // Available room types present in the data
  const availableRoomTypes = useMemo(() => {
    const types = new Set<string>();
    initialGenerations.forEach((g) => {
      if (g.roomType) types.add(g.roomType);
    });
    return Array.from(types);
  }, [initialGenerations]);

  // Filtered generations
  const filteredGenerations = useMemo(() => {
    return initialGenerations.filter((item) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.propertyTitle.toLowerCase().includes(query);
        const matchesRoom = (ROOM_TYPE_LABELS[item.roomType as RoomType] ?? item.roomType)
          .toLowerCase()
          .includes(query);
        const matchesStyle = item.styleName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRoom && !matchesStyle) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // Room Type filter
      if (selectedRoomType !== "all" && item.roomType !== selectedRoomType) {
        return false;
      }

      return true;
    });
  }, [initialGenerations, searchQuery, selectedStatus, selectedRoomType]);

  const hasActiveFilters = searchQuery !== "" || selectedStatus !== "all" || selectedRoomType !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedRoomType("all");
  };

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por propiedad, estancia o estilo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completada</option>
            <option value="processing">En proceso</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallida</option>
            <option value="cancelled">Cancelada</option>
          </select>

          {/* Selector de Estancia */}
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 py-1 text-sm shadow-xs focus:outline-hidden"
          >
            <option value="all">Todas las estancias</option>
            {availableRoomTypes.map((type) => (
              <option key={type} value={type}>
                {ROOM_TYPE_LABELS[type as RoomType] ?? type}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Filter className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Mostrando {filteredGenerations.length} de {initialGenerations.length} generación
          {initialGenerations.length === 1 ? "" : "es"}
        </span>
      </div>

      {/* Lista de Generaciones */}
      {filteredGenerations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={hasActiveFilters ? "Sin resultados" : "Aún no hay generaciones"}
          description={
            hasActiveFilters
              ? "Prueba a cambiar o eliminar los filtros de búsqueda."
              : "Crea tu primera propiedad y añade una habitación para comenzar a decorar con IA."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Link href="/properties">
                <Button size="sm">Ir a propiedades</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGenerations.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between overflow-hidden group">
              <div>
                {/* Imagen preview */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                  {item.outputImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.outputImageUrl}
                      alt={`Decoración ${item.styleName}`}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.originalImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.originalImageUrl}
                      alt="Original"
                      className="size-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                      Sin vista previa
                    </div>
                  )}

                  {/* Badges superpuestos */}
                  <div className="absolute top-2 left-2">
                    <Badge variant={statusVariant(item.status)} className="shadow-xs">
                      {GENERATION_STATUS_LABELS[item.status as GenerationStatus] ?? item.status}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur border-none text-xs">
                      {item.styleName}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/properties/${item.propertyId}`}
                        className="font-medium hover:underline text-sm line-clamp-1"
                      >
                        {item.propertyTitle}
                      </Link>
                      <Link
                        href={`/properties/${item.propertyId}/rooms/${item.roomId}`}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {ROOM_TYPE_LABELS[item.roomType as RoomType] ?? item.roomType}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {item.status === "failed" && item.errorMessage && (
                    <p className="text-xs text-destructive line-clamp-2">
                      {item.errorMessage}
                    </p>
                  )}
                </CardContent>
              </div>

              {/* Botones de acción */}
              <div className="border-t p-3 bg-muted/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {item.status === "completed" && item.outputImageUrl && item.originalImageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveComparison(item)}
                      className="text-xs h-8 gap-1"
                    >
                      <SlidersHorizontal className="size-3.5" />
                      Antes / Después
                    </Button>
                  )}
                  {item.status === "completed" && item.outputImageUrl && (
                    <a
                      href={item.outputImageUrl}
                      download={`generacion-${item.id}.png`}
                      title="Descargar imagen decorada"
                    >
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <Download className="size-3.5" />
                      </Button>
                    </a>
                  )}
                </div>

                <Link
                  href={`/properties/${item.propertyId}/rooms/${item.roomId}`}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
                >
                  <span>Ver estancia</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de comparación Antes / Después */}
      {activeComparison && activeComparison.outputImageUrl && activeComparison.originalImageUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {activeComparison.propertyTitle} — {ROOM_TYPE_LABELS[activeComparison.roomType as RoomType] ?? activeComparison.roomType} ({activeComparison.styleName})
              </h3>
              <p className="text-xs text-muted-foreground">
                Comparador Antes y Después. Arrastra el divisor central.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a href={activeComparison.outputImageUrl} download={`generacion-${activeComparison.id}.png`}>
                <Button size="sm" className="gap-1.5 text-xs">
                  <Download className="size-3.5" />
                  Descargar PNG
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveComparison(null)}
                className="gap-1.5 text-xs"
              >
                <X className="size-4" />
                Cerrar (ESC)
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            <BeforeAfterSlider
              originalUrl={activeComparison.originalImageUrl}
              stagedUrl={activeComparison.outputImageUrl}
              title={`${activeComparison.propertyTitle} — ${activeComparison.styleName}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
