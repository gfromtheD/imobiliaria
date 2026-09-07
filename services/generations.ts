"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type StyleRow = Database["public"]["Tables"]["styles"]["Row"];

export type CreateGenerationResult = {
  id: string;
  status: string;
  style_id: string;
  output_image_path: string | null;
  error_message: string | null;
};

export type CreateGenerationState = {
  error: string | null;
  generation: CreateGenerationResult | null;
};

export type GenerationListItem = {
  id: string;
  style_id: string;
  status: string;
  provider: string;
  output_image_path: string | null;
  error_code: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  completed_at: string | null;
};

function mapGenerationRpcError(errorMessage: string | null) {
  if (!errorMessage) return "No se pudo crear la generación. Inténtalo de nuevo.";
  if (errorMessage.includes("insufficient_credits"))
    return "No tienes créditos suficientes. Añade créditos para continuar.";
  if (errorMessage.includes("image_required"))
    return "La habitación necesita una fotografía original.";
  if (errorMessage.includes("style_not_found"))
    return "El estilo seleccionado ya no está disponible.";
  if (errorMessage.includes("hourly_limit_reached"))
    return "Has alcanzado el límite horario de generaciones.";
  if (errorMessage.includes("subscription_not_active"))
    return "Tu suscripción no está activa.";
  if (errorMessage.includes("subscription_required"))
    return "No se encontró una suscripción para tu organización.";
  if (errorMessage.includes("room_not_found"))
    return "La habitación no existe.";
  if (errorMessage.includes("not_authenticated"))
    return "Debes iniciar sesión para continuar.";
  return "No se pudo crear la generación. Inténtalo de nuevo.";
}

export async function listStyles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("styles")
    .select("id, name, description, ai_preset, active")
    .eq("active", true)
    .order("name");

  if (error) {
    throw new Error("No se pudieron cargar los estilos.", { cause: error });
  }

  return data as StyleRow[];
}

export async function getSubscription() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("credits_available, credits_reserved, plan, status")
    .maybeSingle();

  if (error) {
    throw new Error("No se pudieron cargar los créditos.", { cause: error });
  }

  return data;
}

export async function listGenerations(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, style_id, status, provider, output_image_path, error_code, error_message, retry_count, created_at, completed_at",
    )
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudo cargar el historial de generaciones.", {
      cause: error,
    });
  }

  return data as GenerationListItem[];
}

export async function getStagedImageUrl(outputImagePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("staged-images")
    .createSignedUrl(outputImagePath, 3600);

  if (error) {
    throw new Error("No se pudo generar la imagen decorada.", { cause: error });
  }

  return data.signedUrl;
}

export async function createGenerationAction(
  roomId: string,
  _prevState: CreateGenerationState,
  formData: FormData,
): Promise<CreateGenerationState> {
  void _prevState;

  const styleId = String(formData.get("style_id") ?? "");
  if (!styleId) {
    return { error: "Selecciona un estilo.", generation: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_generation", {
    p_room_id: roomId,
    p_style_id: styleId,
    p_parameters: {},
  });

  if (error) {
    logger.error("create_generation", error.message, error, { roomId, styleId });
    return { error: mapGenerationRpcError(error.message), generation: null };
  }

  const result = data as unknown as CreateGenerationResult;
  if (!result?.id) {
    return {
      error: "Respuesta inesperada del servidor. Inténtalo de nuevo.",
      generation: null,
    };
  }

  return {
    error: null,
    generation: {
      id: result.id,
      status: result.status,
      style_id: result.style_id,
      output_image_path: result.output_image_path,
      error_message: result.error_message,
    },
  };
}

export async function cancelGenerationAction(generationId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_generation", {
    p_generation_id: generationId,
  });

  if (error) {
    return {
      error: "No se pudo cancelar la generación. Inténtalo de nuevo.",
    };
  }

  return { error: null };
}

export async function getOriginalImageUrlByPath(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("original-images")
    .createSignedUrl(path, 3600);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export type AllGenerationsItem = {
  id: string;
  status: string;
  styleId: string;
  styleName: string;
  roomId: string;
  roomType: string;
  propertyId: string;
  propertyTitle: string;
  outputImageUrl: string | null;
  originalImageUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  completedAt: string | null;
};

export async function listAllGenerations(): Promise<AllGenerationsItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("generations")
    .select(`
      id,
      style_id,
      status,
      output_image_path,
      error_message,
      retry_count,
      created_at,
      completed_at,
      rooms!inner (
        id,
        room_type,
        original_image_path,
        properties!inner (
          id,
          title
        )
      ),
      styles (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudo cargar el historial global de generaciones.", {
      cause: error,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRows = (data ?? []) as any[];

  const items = await Promise.all(
    rawRows.map(async (row) => {
      let outputImageUrl: string | null = null;
      if (row.status === "completed" && row.output_image_path) {
        outputImageUrl = await getStagedImageUrl(row.output_image_path).catch(() => null);
      }

      let originalImageUrl: string | null = null;
      if (row.rooms?.original_image_path) {
        originalImageUrl = await getOriginalImageUrlByPath(row.rooms.original_image_path);
      }

      return {
        id: row.id,
        status: row.status,
        styleId: row.style_id,
        styleName: row.styles?.name ?? "Estilo",
        roomId: row.rooms?.id ?? "",
        roomType: row.rooms?.room_type ?? "Estancia",
        propertyId: row.rooms?.properties?.id ?? "",
        propertyTitle: row.rooms?.properties?.title ?? "Propiedad",
        outputImageUrl,
        originalImageUrl,
        errorMessage: row.error_message,
        retryCount: row.retry_count,
        createdAt: row.created_at,
        completedAt: row.completed_at,
      };
    }),
  );

  return items;
}
