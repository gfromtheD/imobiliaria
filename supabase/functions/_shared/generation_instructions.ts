import type { FidelityPolicy, ResolvedGenerationInstructions } from "./generation_provider.ts";

// The product row already records `prompt_version = v1`; keep the first
// structured resolver on that version until a future approved migration changes it.
export const PROMPT_VERSION = "v1";

const FIDELITY_POLICY: FidelityPolicy = {
  version: "v1",
  invariants: [
    "arquitectura y geometría visibles",
    "perspectiva y encuadre",
    "paredes, suelos y techos",
    "puertas, ventanas, columnas y escaleras",
    "vistas exteriores y elementos estructurales",
  ],
  editable: ["mobiliario", "textiles", "decoración", "vegetación"],
  conditional: ["iluminación ambiental necesaria para integrar el mobiliario"],
};

type PresetDefinition = {
  label: string;
  palette: string;
  furniture: string;
  decoration: string;
};

const PRESETS: Record<string, PresetDefinition> = {
  modern: {
    label: "moderno",
    palette: "neutra y equilibrada",
    furniture: "contemporáneo de líneas limpias",
    decoration: "sobria y funcional",
  },
  scandinavian: {
    label: "nórdico",
    palette: "clara, cálida y natural",
    furniture: "ligero de madera clara",
    decoration: "minimalista con textiles suaves",
  },
  minimalist: {
    label: "minimalista",
    palette: "neutra y reducida",
    furniture: "esencial y de baja densidad",
    decoration: "muy contenida",
  },
  luxury: {
    label: "lujo",
    palette: "elegante y cálida",
    furniture: "sofisticado y proporcionado",
    decoration: "refinada sin sobrecargar la estancia",
  },
};

function list(values: readonly string[]): string {
  return values.join(", ");
}

/**
 * Resolves the exact, versioned instruction set used by both adapters and the
 * manual benchmark package. UI parameters never participate in this process.
 */
export function resolveGenerationInstructions(
  roomType: string,
  presetId: string,
): ResolvedGenerationInstructions {
  const preset = PRESETS[presetId];
  if (!preset) {
    throw new Error(`unsupported_preset:${presetId}`);
  }

  const prompt = [
    "Virtual staging de interiorismo profesional para una fotografía inmobiliaria existente.",
    `Tipo de estancia: ${roomType}.`,
    `Preset ${preset.label} v1: paleta ${preset.palette}; mobiliario ${preset.furniture}; decoración ${preset.decoration}.`,
    `Conserva sin cambios: ${list(FIDELITY_POLICY.invariants)}.`,
    `Solo añade: ${list(FIDELITY_POLICY.editable)}.`,
    `Permitido únicamente de forma limitada: ${list(FIDELITY_POLICY.conditional)}.`,
    "Resultado fotorrealista, coherente y listo para marketing inmobiliario.",
  ].join(" ");

  return {
    prompt,
    promptVersion: PROMPT_VERSION,
    presetId,
    presetVersion: "v1",
    roomType,
    fidelityPolicy: FIDELITY_POLICY,
  };
}
