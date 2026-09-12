"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FrameAlt, RefreshDouble } from "iconoir-react";

import { BeforeAfterSlider } from "@/components/generations/before-after-slider";
import { GenerationForm } from "@/components/generations/generation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductIcon } from "@/components/ui/product-icon";
import {
  GENERATION_STATUS_DESCRIPTIONS,
  GENERATION_STATUS_LABELS,
  type GenerationStatus,
} from "@/lib/domain";
import { cancelGenerationAction } from "@/services/generations";

export type GenerationViewItem = {
  id: string;
  styleId: string;
  status: string;
  outputImageUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  completedAt: string | null;
};

const POLL_INTERVAL_MS = 5000;

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

export function GenerationsSection({
  roomId,
  sourceImageId,
  originalImageUrl,
  styles,
  credits,
  generations,
}: {
  roomId: string;
  sourceImageId: string | null;
  originalImageUrl?: string | null;
  styles: { id: string; name: string; description: string | null }[];
  credits: { creditsAvailable: number; creditsReserved: number } | null;
  generations: GenerationViewItem[];
}) {
  const router = useRouter();
  const [cancelError, setCancelError] = useState<string | null>(null);

  const activeCount = generations.filter(
    (g) => g.status === "pending" || g.status === "processing",
  ).length;
  const hasActive = activeCount > 0;

  useEffect(() => {
    if (!hasActive) return;
    const interval = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasActive, router]);

  const styleName = (styleId: string) =>
    styles.find((s) => s.id === styleId)?.name ?? "Estilo";

  const creditsAvailable = credits?.creditsAvailable ?? 0;
  const creditsReserved = credits?.creditsReserved ?? 0;

  let disabledReason: string | null = null;
  if (!sourceImageId) {
    disabledReason = "Selecciona una fotografía original lista para generar.";
  } else if (creditsAvailable <= 0) {
    disabledReason = "No tienes créditos disponibles.";
  }

  async function handleCancel(generationId: string) {
    setCancelError(null);
    const result = await cancelGenerationAction(generationId);
    if (result.error) {
      setCancelError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Decoración con IA</CardTitle>
            <CardDescription>
              Elige un estilo y genera una imagen decorada de esta habitación.
            </CardDescription>
          </div>
          {credits && (
            <Badge variant="outline">
              {creditsAvailable} crédito{creditsAvailable === 1 ? "" : "s"}
              {creditsReserved > 0
                ? ` · ${creditsReserved} en uso`
                : ""}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <GenerationForm
            roomId={roomId}
            sourceImageId={sourceImageId}
            styles={styles}
            disabled={!sourceImageId || creditsAvailable <= 0}
            disabledReason={disabledReason}
            onCreated={() => router.refresh()}
          />
        </CardContent>
      </Card>

      {cancelError && <p className="text-sm text-destructive">{cancelError}</p>}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Historial</h2>
        {generations.length === 0 ? (
          <EmptyState
            icon={FrameAlt}
            title="Aún no hay generaciones"
            description="Genera la primera decoración de esta habitación con el estilo que prefieras."
          />
        ) : (
          <div className="space-y-4">
            {generations.map((generation) => (
              <Card key={generation.id}>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {styleName(generation.styleId)}
                      </h3>
                      <Badge variant={statusVariant(generation.status)}>
                        {GENERATION_STATUS_LABELS[
                          generation.status as GenerationStatus
                        ] ?? generation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(generation.createdAt).toLocaleString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {GENERATION_STATUS_DESCRIPTIONS[
                      generation.status as GenerationStatus
                    ] ?? ""}
                    {generation.retryCount > 0 &&
                      generation.status !== "completed" &&
                      ` Intento ${generation.retryCount}.`}
                  </p>

                  {generation.status === "failed" && generation.errorMessage && (
                    <p className="text-sm text-destructive">
                      {generation.errorMessage}
                    </p>
                  )}

                  {generation.outputImageUrl && (
                    <div className="pt-2">
                      {originalImageUrl ? (
                        <BeforeAfterSlider
                          originalUrl={originalImageUrl}
                          stagedUrl={generation.outputImageUrl}
                          altStaged={`Decoración ${styleName(generation.styleId).toLowerCase()}`}
                          title={`Estilo ${styleName(generation.styleId)}`}
                        />
                      ) : (
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={generation.outputImageUrl}
                            alt={`Decoración ${styleName(generation.styleId).toLowerCase()}`}
                            className="w-full rounded-lg border object-cover"
                          />
                          <a
                            href={generation.outputImageUrl}
                            download={`generacion-${generation.id}.png`}
                          >
                            <Button variant="outline" size="sm">
                              Descargar PNG
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {(generation.status === "pending" || generation.status === "processing") && (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 rounded-sm border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground">
                        <ProductIcon
                          icon={RefreshDouble}
                          className="size-3.5 animate-spin motion-reduce:animate-none"
                        />
                        <span>Generando decoración con IA...</span>
                      </div>
                      {generation.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(generation.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
