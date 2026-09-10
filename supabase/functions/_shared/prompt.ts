// Compatibilidad del import anterior. La resolución real vive en
// generation_instructions.ts para que worker y benchmark compartan el mismo
// contrato versionado.
export { PROMPT_VERSION, resolveGenerationInstructions } from "./generation_instructions.ts";

import { resolveGenerationInstructions } from "./generation_instructions.ts";

export function buildStagingPrompt(roomType: string, stylePreset: string): string {
  return resolveGenerationInstructions(roomType, stylePreset).prompt;
}
