import { resolveGenerationInstructions } from "../functions/_shared/generation_instructions.ts";
import { createManualBenchmarkPackage } from "../functions/_shared/manual_benchmark.ts";

type Arguments = {
  generationId: string;
  originalPath: string;
  roomType: string;
  preset: string;
  output: string;
};

function parseArguments(args: string[]): Arguments {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || !value) {
      throw new Error("Usage: --generation-id ID --original-path PATH --room-type TYPE --preset PRESET --out FILE");
    }
    values.set(key.slice(2), value);
  }

  const generationId = values.get("generation-id");
  const originalPath = values.get("original-path");
  const roomType = values.get("room-type");
  const preset = values.get("preset");
  const output = values.get("out");
  if (!generationId || !originalPath || !roomType || !preset || !output) {
    throw new Error("Missing required benchmark package argument");
  }
  return { generationId, originalPath, roomType, preset, output };
}

const args = parseArguments(Deno.args);
const instructions = resolveGenerationInstructions(args.roomType, args.preset);
const benchmarkPackage = createManualBenchmarkPackage({
  generationId: args.generationId,
  originalImage: { bucket: "original-images", path: args.originalPath },
  instructions,
});

await Deno.writeTextFile(args.output, `${JSON.stringify(benchmarkPackage, null, 2)}\n`);
