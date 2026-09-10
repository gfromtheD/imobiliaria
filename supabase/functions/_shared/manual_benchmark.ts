import {
  GENERATION_PROVIDER_CONTRACT_VERSION,
  type OriginalImageReference,
  type ResolvedGenerationInstructions,
} from "./generation_provider.ts";

/**
 * Development-only, serializable hand-off for a human visual benchmark.
 * It deliberately contains no signed URL, credentials or provider request.
 */
export interface ManualBenchmarkPackage {
  schemaVersion: typeof GENERATION_PROVIDER_CONTRACT_VERSION;
  generationId: string;
  originalImage: OriginalImageReference;
  roomType: string;
  instructions: ResolvedGenerationInstructions;
  usage: "manual-benchmark-only";
}

export function createManualBenchmarkPackage(input: {
  generationId: string;
  originalImage: OriginalImageReference;
  instructions: ResolvedGenerationInstructions;
}): ManualBenchmarkPackage {
  return {
    schemaVersion: GENERATION_PROVIDER_CONTRACT_VERSION,
    generationId: input.generationId,
    originalImage: input.originalImage,
    roomType: input.instructions.roomType,
    instructions: input.instructions,
    usage: "manual-benchmark-only",
  };
}
