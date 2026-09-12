"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ControlSlider,
  Download,
  Eye,
  Expand,
  Xmark,
} from "iconoir-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductIcon } from "@/components/ui/product-icon";

export interface BeforeAfterSliderProps {
  originalUrl: string;
  stagedUrl: string;
  altOriginal?: string;
  altStaged?: string;
  title?: string;
  showDownload?: boolean;
}

export function BeforeAfterSlider({
  originalUrl,
  stagedUrl,
  altOriginal = "Habitación original",
  altStaged = "Habitación transformada por ambivio",
  title,
  showDownload = true,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"slider" | "staged" | "original">("slider");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number, targetContainer: HTMLDivElement | null) => {
    if (!targetContainer) return;
    const rect = targetContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = Math.round((clampedX / rect.width) * 100);
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const container = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
    handleMove(e.clientX, container);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderPosition((position) => Math.max(0, position - step));
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderPosition((position) => Math.min(100, position + step));
    }
    if (e.key === "Home") {
      e.preventDefault();
      setSliderPosition(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const container = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
      handleMove(e.clientX, container);
    };

    const handlePointerUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, isFullscreen, handleMove]);

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const renderSliderContent = (fullscreen: boolean) => {
    const activeRef = fullscreen ? fullscreenContainerRef : containerRef;

    return (
      <div
        ref={activeRef}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role={viewMode === "slider" ? "slider" : undefined}
        tabIndex={viewMode === "slider" ? 0 : -1}
        aria-label={viewMode === "slider" ? "Comparación entre fotografía original y resultado" : undefined}
        aria-valuemin={viewMode === "slider" ? 0 : undefined}
        aria-valuemax={viewMode === "slider" ? 100 : undefined}
        aria-valuenow={viewMode === "slider" ? sliderPosition : undefined}
        aria-valuetext={viewMode === "slider" ? `${sliderPosition}% fotografía original visible` : undefined}
        className={`relative select-none overflow-hidden rounded-lg border bg-muted cursor-ew-resize group touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
          fullscreen ? "h-[75vh] w-full max-w-6xl mx-auto flex items-center justify-center" : "aspect-16/10 w-full"
        }`}
      >
        {viewMode === "original" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={originalUrl}
            alt={altOriginal}
            className="size-full object-contain pointer-events-none"
          />
        ) : viewMode === "staged" ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={stagedUrl}
            alt={altStaged}
            className="size-full object-contain pointer-events-none"
          />
        ) : (
          <>
            {/* Imagen posterior en fondo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stagedUrl}
              alt={altStaged}
              className="absolute inset-0 size-full object-contain pointer-events-none"
            />

            {/* Imagen Antes (Original) recortada */}
            <div
              className="absolute inset-0 size-full overflow-hidden pointer-events-none transition-[clip-path] duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] motion-reduce:transition-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt={altOriginal}
                className="absolute inset-0 size-full object-contain pointer-events-none"
              />
            </div>

            {/* Divisor vertical */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Handle con icono */}
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-slate-800 border border-slate-200">
                <div className="flex items-center gap-0.5 text-xs font-bold select-none">
                  <span>‹</span>
                  <span>›</span>
                </div>
              </div>
            </div>

            {/* Badges Antes / Después */}
            <div className="absolute top-3 left-3 pointer-events-none z-10">
              <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur border-none text-xs">
                Antes (Original)
              </Badge>
            </div>
            <div className="absolute top-3 right-3 pointer-events-none z-10">
              <Badge variant="default" className="bg-primary/90 text-primary-foreground backdrop-blur text-xs">
                Después (IA Staging)
              </Badge>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Controles superiores */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={viewMode === "slider" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("slider")}
            className="text-xs h-8 gap-1.5"
          >
            <ProductIcon icon={ControlSlider} className="size-3.5" />
            Comparador
          </Button>
          <Button
            type="button"
            variant={viewMode === "staged" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("staged")}
            className="text-xs h-8 gap-1.5"
          >
            <ProductIcon icon={Eye} className="size-3.5" />
            Staging
          </Button>
          <Button
            type="button"
            variant={viewMode === "original" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("original")}
            className="text-xs h-8 gap-1.5"
          >
            Original
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="text-xs h-8 gap-1.5"
            title="Ver a pantalla completa"
          >
            <ProductIcon icon={Expand} className="size-3.5" />
            Pantalla completa
          </Button>

          {showDownload && (
            <a href={stagedUrl} download="staging-decorado.png">
              <Button size="sm" className="text-xs h-8 gap-1.5">
                <ProductIcon icon={Download} className="size-3.5" />
                Descargar PNG
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Slider en línea */}
      {renderSliderContent(false)}

      {/* Modal Pantalla Completa */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">{title ?? "Comparador Before / After"}</h3>
              <p className="text-xs text-muted-foreground">
                Arrastra el divisor central para comparar la estancia original y el staging virtual.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {showDownload && (
                <a href={stagedUrl} download="staging-decorado.png">
                  <Button size="sm" className="gap-1.5 text-xs">
                    <ProductIcon icon={Download} className="size-3.5" />
                    Descargar PNG
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="gap-1.5 text-xs"
              >
                <ProductIcon icon={Xmark} className="size-4" />
                Cerrar (ESC)
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            {renderSliderContent(true)}
          </div>
        </div>
      )}
    </div>
  );
}
