"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Download, FrameAlt, RefreshDouble, Undo, WarningTriangle } from "iconoir-react";

import { BeforeAfterSlider } from "@/components/generations/before-after-slider";
import { GenerationForm } from "@/components/generations/generation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { GENERATION_STATUS_LABELS, type GenerationStatus } from "@/lib/domain";
import { cancelGenerationAction, retryGenerationAction } from "@/services/generations";

export type GenerationViewItem = {
  id: string;
  styleId: string;
  sourceImageId: string;
  sourceImageUrl: string | null;
  status: string;
  outputImageUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  completedAt: string | null;
};

const POLL_INTERVAL_MS = 5000;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function statusVariant(status: string) {
  if (status === "completed") return "default" as const;
  if (status === "failed") return "destructive" as const;
  if (status === "processing") return "outline" as const;
  return "secondary" as const;
}

function ProcessingPanel({ status }: { status: "pending" | "processing" }) {
  const isProcessing = status === "processing";
  return (
    <div className="relative overflow-hidden border border-border bg-muted/30 p-5 sm:p-6" aria-live="polite" aria-atomic="true">
      <div aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 bg-foreground ${isProcessing ? "ambivio-generation-line motion-reduce:animate-none" : "opacity-35"}`} />
      <div className="flex items-start gap-4 pl-2">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center border border-foreground bg-background">
          <ProductIcon icon={isProcessing ? FrameAlt : Clock} className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{isProcessing ? "El espacio se está reinterpretando." : "Tu generación está registrada y esperando procesamiento."}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{isProcessing ? "Puedes continuar trabajando: el resultado aparecerá aquí al completarse." : "La cola se actualizará automáticamente cuando el worker la recoja."}</p>
        </div>
      </div>
    </div>
  );
}

function DownloadResultButton({ href, generationId }: { href: string; generationId: string }) {
  const [status, setStatus] = useState<"idle" | "downloading" | "error">("idle");
  async function download() {
    setStatus("downloading");
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error("download_failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ambivio-${generationId}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }
  return (
    <div className="grid gap-2">
      <Button type="button" onClick={() => void download()} disabled={status === "downloading"}>
        <ProductIcon icon={status === "downloading" ? RefreshDouble : Download} className={`size-4 ${status === "downloading" ? "animate-spin motion-reduce:animate-none" : ""}`} />
        {status === "downloading" ? "Preparando descarga…" : "Descargar imagen"}
      </Button>
      {status === "error" && <p role="alert" className="text-xs text-destructive">No se pudo descargar la imagen. Recarga la página para obtener un enlace nuevo.</p>}
    </div>
  );
}

export function GenerationsSection({ roomId, sourceImageId, originalImageUrl, styles, credits, generations }: {
  roomId: string;
  sourceImageId: string | null;
  originalImageUrl?: string | null;
  styles: { id: string; name: string; description: string | null }[];
  credits: { creditsAvailable: number; creditsReserved: number } | null;
  generations: GenerationViewItem[];
}) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const activeGeneration = generations.find((generation) => generation.status === "pending" || generation.status === "processing");
  const completedGeneration = generations.find((generation) => generation.status === "completed" && generation.outputImageUrl);
  const hasActive = Boolean(activeGeneration);
  const creditsAvailable = credits?.creditsAvailable ?? 0;
  const disabledReason = !sourceImageId ? "Selecciona una fotografía original lista para generar." : credits && creditsAvailable <= 0 ? "No tienes créditos disponibles." : null;

  useEffect(() => {
    if (!hasActive) return;
    const interval = window.setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [hasActive, router]);

  const styleName = (styleId: string) => styles.find((style) => style.id === styleId)?.name ?? "Estilo";
  async function cancel(generationId: string) {
    setActionError(null);
    const result = await cancelGenerationAction(generationId);
    setActionError(result.error);
    if (!result.error) router.refresh();
  }
  async function retry(generationId: string) {
    setActionError(null);
    const result = await retryGenerationAction(generationId);
    setActionError(result.error);
    if (!result.error) router.refresh();
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-6 border-y border-border py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(19rem,0.6fr)] lg:items-start">
        <div className="relative aspect-[4/3] overflow-hidden border bg-muted">
          {originalImageUrl ? (
            // Signed private URLs cannot be passed to next/image as remote static hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={originalImageUrl} alt="Fotografía original seleccionada" className="size-full object-cover" />
          ) : <div className="grid size-full place-items-center p-6 text-center text-sm text-muted-foreground">Selecciona una fotografía lista para configurar la generación.</div>}
          <span className="absolute left-3 top-3 border border-foreground bg-background px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em]">Fotografía fuente</span>
        </div>
        <div className="lg:pt-3">
          <p className="text-label">Siguiente posibilidad</p>
          <h2 className="mt-3 text-heading font-medium">Generar una propuesta visual</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Elige un estilo. Ambivio conservará esta fotografía como referencia de la generación.</p>
          {credits && <p className="mt-5 text-sm text-muted-foreground">{creditsAvailable} crédito{creditsAvailable === 1 ? " disponible" : "s disponibles"}{credits.creditsReserved > 0 ? ` · ${credits.creditsReserved} reservado${credits.creditsReserved === 1 ? "" : "s"}` : ""}</p>}
          <div className="mt-6"><GenerationForm roomId={roomId} sourceImageId={sourceImageId} styles={styles} disabled={Boolean(disabledReason) || hasActive} disabledReason={hasActive ? "Hay una generación en curso para esta habitación." : disabledReason} onCreated={() => router.refresh()} /></div>
        </div>
      </section>

      {actionError && <p role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{actionError}</p>}

      {activeGeneration && <section aria-label="Generación en curso" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-label">Generación actual</p><h2 className="mt-2 text-heading font-medium">{styleName(activeGeneration.styleId)}</h2></div><Badge variant={statusVariant(activeGeneration.status)}>{GENERATION_STATUS_LABELS[activeGeneration.status as GenerationStatus] ?? activeGeneration.status}</Badge></div>
        <ProcessingPanel status={activeGeneration.status as "pending" | "processing"} />
        {activeGeneration.status === "pending" && <Button type="button" variant="outline" size="sm" onClick={() => void cancel(activeGeneration.id)}>Cancelar generación</Button>}
      </section>}

      {completedGeneration?.outputImageUrl && <section className="space-y-5" aria-label="Resultado de la generación">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-label">Resultado listo</p><h2 className="mt-2 text-heading font-medium">{styleName(completedGeneration.styleId)}</h2><p className="mt-2 text-sm text-muted-foreground">Completada {completedGeneration.completedAt ? formatDate(completedGeneration.completedAt) : "recientemente"}.</p></div><DownloadResultButton href={completedGeneration.outputImageUrl} generationId={completedGeneration.id} /></div>
        {completedGeneration.sourceImageUrl ? <BeforeAfterSlider originalUrl={completedGeneration.sourceImageUrl} stagedUrl={completedGeneration.outputImageUrl} altStaged={`Resultado de estilo ${styleName(completedGeneration.styleId).toLowerCase()}`} title={`Resultado · ${styleName(completedGeneration.styleId)}`} showDownload={false} /> : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={completedGeneration.outputImageUrl} alt="Resultado de la generación" className="w-full border object-contain" />
        )}
      </section>}

      <section className="space-y-4 border-t border-border pt-8" aria-label="Generaciones anteriores">
        <div><p className="text-label">Registro de esta habitación</p><h2 className="mt-2 text-heading font-medium">Generaciones anteriores</h2></div>
        {generations.length === 0 ? <p className="border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">Aún no hay generaciones para esta habitación.</p> : (
          <div className="divide-y divide-border border-y border-border">{generations.map((generation) => <article key={generation.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{styleName(generation.styleId)}</p><Badge variant={statusVariant(generation.status)}>{GENERATION_STATUS_LABELS[generation.status as GenerationStatus] ?? generation.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">Creada {formatDate(generation.createdAt)}{generation.retryCount > 1 ? ` · reintento ${generation.retryCount - 1}` : ""}</p>{generation.status === "failed" && <p className="mt-2 text-sm text-muted-foreground">No se pudo completar. Puedes volver a intentarlo.</p>}{generation.status === "cancelled" && <p className="mt-2 text-sm text-muted-foreground">Cancelada antes de iniciar el procesamiento.</p>}</div>
            {generation.status === "failed" && <Button type="button" variant="outline" size="sm" onClick={() => void retry(generation.id)}><ProductIcon icon={Undo} className="size-3.5" /> Reintentar</Button>}
            {generation.status === "failed" && !generation.errorMessage && <ProductIcon icon={WarningTriangle} className="size-4 text-muted-foreground" aria-label="Generación fallida" />}{generation.status === "completed" && <ProductIcon icon={CheckCircle} className="size-4" aria-label="Generación completada" />}
          </article>)}</div>
        )}
      </section>
    </div>
  );
}
