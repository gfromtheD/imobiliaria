import { resolveGenerationInstructions } from "./generation_instructions.ts";
import { createManualBenchmarkPackage } from "./manual_benchmark.ts";
import { MockAdapter } from "./mock_adapter.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function input(parameters: Record<string, unknown> = {}) {
  let loadCalls = 0;
  return {
    loadCalls: () => loadCalls,
    value: {
      generationId: "00000000-0000-0000-0000-000000000001",
      attempt: 1,
      originalImage: {
        reference: { bucket: "original-images" as const, path: "org/property/room.png" },
        load: async () => {
          loadCalls += 1;
          return { bytes: new Uint8Array([1]), mime: "image/png" as const };
        },
      },
      instructions: resolveGenerationInstructions("salón", "modern"),
      parameters,
    },
  };
}

Deno.test("MockAdapter satisfies the synchronous provider contract without loading originals", async () => {
  const fixture = input();
  const submission = await new MockAdapter().submit(fixture.value);

  assert(submission.status === "completed", "MockAdapter must complete synchronously");
  assert(submission.result.provider === "mock", "Mock provider identity must be preserved");
  assert(submission.result.providerCostEstimate === 0, "Mock must never have provider cost");
  assert(submission.result.image.mime === "image/png", "Mock result must be a PNG");
  assert(submission.result.image.bytes.length > 0, "Mock must return image bytes");
  assert(fixture.loadCalls() === 0, "Mock must not load the private original image");
});

Deno.test("manual benchmark packages preserve the resolved instructions without URLs", () => {
  const fixture = input();
  const benchmarkPackage = createManualBenchmarkPackage({
    generationId: fixture.value.generationId,
    originalImage: fixture.value.originalImage.reference,
    instructions: fixture.value.instructions,
  });

  assert(benchmarkPackage.usage === "manual-benchmark-only", "Package must be development-only");
  assert(benchmarkPackage.instructions.promptVersion === "v1", "Prompt version must be explicit");
  assert(!JSON.stringify(benchmarkPackage).includes("http"), "Package must not contain a URL");
});
