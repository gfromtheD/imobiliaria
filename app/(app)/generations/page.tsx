import type { Metadata } from "next";

import { GenerationsHistoryView } from "@/components/generations/generations-history-view";
import { listAllGenerations } from "@/services/generations";

export const metadata: Metadata = {
  title: "Historial de Generaciones",
};

export default async function GenerationsPage() {
  const generations = await listAllGenerations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historial de Generaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualiza, filtra y compara todas las decoraciones virtuales generadas con IA en tus inmuebles.
        </p>
      </div>

      <GenerationsHistoryView initialGenerations={generations} />
    </div>
  );
}
