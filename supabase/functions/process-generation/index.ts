// process-generation — Fase 1 worker del pipeline de generación.
// Invocado desde process_generation_jobs() (pg_cron + pg_net):
//   { generation_id, api_url? }
// Flujo: claim atómico -> contexto (room/style) -> MockAdapter -> subida a staged-images
// (ruta determinista con job_id) -> complete_generation (consume crédito + ledger).
// Errores -> fail_generation (devolución de crédito si el job es terminal; el esquema
// reabre jobs reintentables automáticamente).
// Auth: usa SUPABASE_SERVICE_ROLE_KEY (env) si está disponible (producción); si no,
// hace passthrough del header entrante (dev sin service role no puede escribir Storage).

import { MockAdapter } from "../_shared/mock_adapter.ts";
import {
  ProviderError,
  type ImageArtifact,
  type ImageMimeType,
  type ProviderAdapter,
} from "../_shared/generation_provider.ts";
import { resolveGenerationInstructions } from "../_shared/generation_instructions.ts";

// The configured adapter stays behind the Ambivio contract. This phase keeps
// MockAdapter as the only implementation and makes no external request.
const provider: ProviderAdapter = new MockAdapter();

type Row = Record<string, unknown>;

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function authHeaders(auth: string, apikey?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: apikey ?? auth.replace(/^Bearer\s+/i, ""),
    Authorization: auth,
  };
}

function asRow(payload: unknown): Row | null {
  if (Array.isArray(payload)) return payload.length > 0 ? (payload[0] as Row) : null;
  if (payload && typeof payload === "object") return payload as Row;
  return null;
}

async function callRpc(
  apiUrl: string,
  auth: string,
  apikey: string,
  fn: string,
  args: Record<string, unknown>,
): Promise<Row | null> {
  const res = await fetch(`${apiUrl}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: authHeaders(auth, apikey),
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${fn} failed: ${res.status} ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  return asRow(await res.json());
}

async function getRow(
  apiUrl: string,
  auth: string,
  apikey: string,
  table: string,
  select: string,
  id: string,
): Promise<Row | null> {
  const res = await fetch(
    `${apiUrl}/rest/v1/${table}?select=${select}&id=eq.${id}`,
    { headers: authHeaders(auth, apikey) },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table} fetch failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return asRow(await res.json());
}

async function uploadImage(
  apiUrl: string,
  auth: string,
  apikey: string,
  path: string,
  image: ImageArtifact,
): Promise<void> {
  const res = await fetch(`${apiUrl}/storage/v1/object/staged-images/${path}`, {
    method: "POST",
    headers: {
      apikey,
      Authorization: auth,
      "Content-Type": image.mime,
    },
    body: new Uint8Array(image.bytes).buffer,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`storage upload failed: ${res.status} ${text.slice(0, 300)}`);
  }
}

function outputExtension(mime: ImageMimeType): "png" | "jpg" {
  return mime === "image/png" ? "png" : "jpg";
}

/**
 * A future real adapter may call this loader to obtain private image bytes.
 * MockAdapter never invokes it, so this phase does not read or expose uploads.
 */
async function downloadOriginalImage(
  apiUrl: string,
  auth: string,
  apikey: string,
  path: string,
): Promise<ImageArtifact> {
  const res = await fetch(`${apiUrl}/storage/v1/object/original-images/${path}`, {
    headers: { apikey, Authorization: auth },
  });
  if (!res.ok) {
    throw new ProviderError("original_image_unavailable", "Original image is unavailable", {
      retryable: true,
    });
  }
  const contentType = res.headers.get("content-type")?.split(";", 1)[0];
  if (contentType !== "image/jpeg" && contentType !== "image/png") {
    throw new ProviderError("original_image_type_invalid", "Original image type is invalid", {
      terminal: true,
    });
  }
  return {
    bytes: new Uint8Array(await res.arrayBuffer()),
    mime: contentType,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return respond({ error: "method_not_allowed" }, 405);

  let body: { generation_id?: string; api_url?: string } = {};
  try {
    body = await req.json();
  } catch {
    return respond({ error: "invalid_json" }, 400);
  }

  const generationId = body.generation_id;
  if (!generationId) return respond({ error: "missing_generation_id" }, 400);

  const apiUrl = body.api_url ?? Deno.env.get("SUPABASE_URL") ?? "";
  if (!apiUrl) return respond({ error: "missing_api_url" }, 400);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const incomingAuth = req.headers.get("authorization") ?? "";
  const auth = serviceKey ? `Bearer ${serviceKey}` : incomingAuth;
  const apikey = serviceKey ? serviceKey : incomingAuth.replace(/^Bearer\s+/i, "");
  if (!auth) return respond({ error: "missing_auth" }, 401);

  // 1. Claim atómico: solo un worker puede pasar pending -> processing.
  let claimed: Row | null;
  try {
    claimed = await callRpc(apiUrl, auth, apikey, "claim_generation", {
      p_generation_id: generationId,
    });
  } catch (err) {
    return respond({ generation_id: generationId, ok: false, step: "claim", error: String(err) }, 500);
  }

  if (!claimed) {
    return respond({
      generation_id: generationId,
      ok: false,
      claimed: false,
      note: "not claimed (already processing, completed or cancelled)",
    });
  }

  const retryCount = Number(claimed.retry_count ?? 0);
  const parameters = (claimed.parameters ?? {}) as Record<string, unknown>;

  try {
    // 2. Contexto del job (room + style).
    const room = await getRow(
      apiUrl, auth, apikey, "rooms",
      "room_type,property_id,organization_id,original_image_path",
      String(claimed.room_id),
    );
    const style = await getRow(
      apiUrl, auth, apikey, "styles",
      "ai_preset,name",
      String(claimed.style_id),
    );
    if (!room || !style) {
      const err = new Error("missing room or style context") as Error & { code?: string; retryable?: boolean };
      err.code = "missing_context";
      err.retryable = false;
      throw err;
    }

    const originalImagePath = String(room.original_image_path ?? "");
    if (!originalImagePath) {
      throw new ProviderError("missing_original_image", "Original image is missing", { terminal: true });
    }

    // 3. Instrucciones versionadas + contrato de proveedor. El loader conserva
    // los bytes en el worker y nunca crea una signed URL persistente.
    let instructions;
    try {
      instructions = resolveGenerationInstructions(String(room.room_type), String(style.ai_preset));
    } catch {
      throw new ProviderError("unsupported_preset", "Style preset is unsupported", { terminal: true });
    }
    const submission = await provider.submit({
      generationId,
      attempt: retryCount,
      originalImage: {
        reference: { bucket: "original-images", path: originalImagePath },
        load: () => downloadOriginalImage(apiUrl, auth, apikey, originalImagePath),
      },
      instructions,
      parameters,
    });

    // This branch is intentionally unreachable while MockAdapter is configured.
    // A future async adapter needs an approved RPC/migration to persist its job
    // id before polling, preventing ambiguous retry charges.
    if (submission.status === "submitted") {
      throw new ProviderError(
        "async_provider_not_enabled",
        "Async provider persistence is not enabled",
        { terminal: true },
      );
    }
    const artifact = submission.result;

    // 4. Resultado a staged-images con ruta determinista {org}/{property}/{room}/{job}.
    const outputPath = `${room.organization_id}/${room.property_id}/${claimed.room_id}/${claimed.id}.${outputExtension(artifact.image.mime)}`;
    await uploadImage(apiUrl, auth, apikey, outputPath, artifact.image);

    // 5. Completar: consume el crédito reservado y registra uso.
    await callRpc(apiUrl, auth, apikey, "complete_generation", {
      p_generation_id: generationId,
      p_output_path: outputPath,
      p_provider_job_id: `${artifact.provider}-${generationId}`,
      p_cost_estimate: artifact.providerCostEstimate,
      p_metadata: {
        prompt: instructions.prompt.slice(0, 200),
        prompt_version: instructions.promptVersion,
        preset_version: instructions.presetVersion,
        model: artifact.model,
        width: artifact.image.width ?? 0,
        height: artifact.image.height ?? 0,
        ...artifact.metadata,
      },
    });

    return respond({ generation_id: generationId, ok: true, output_path: outputPath });
  } catch (err) {
    const e = err as Error & { code?: string; retryable?: boolean };
    const retryable = e.retryable !== false;
    try {
      await callRpc(apiUrl, auth, apikey, "fail_generation", {
        p_generation_id: generationId,
        p_error_code: e.code ?? "unknown",
        p_error_message: e.message ?? String(err),
        p_retryable: retryable,
      });
    } catch {
      // fallo al registrar el fallo; el auto-retry por timeout lo recuperará
    }
    return respond(
      { generation_id: generationId, ok: false, error: e.code ?? "unknown", retryable },
      500,
    );
  }
});
