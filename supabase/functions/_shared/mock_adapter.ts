// MockAdapter — simulates an AI image provider without real API keys.
// Phase 0 validation only. Never used to call OpenAI/FLUX.

export class MockAdapter {
  /**
   * Simulates provider work.
   * If payload.fail === true and this is the first attempt, throws a controlled
   * provider error (transient failure). A retry (attempt > 1) succeeds.
   * Otherwise returns a simulated result artifact after a short delay.
   */
  async generate(
    payload: Record<string, unknown>,
    context: { attempt?: number } = {},
  ): Promise<Record<string, unknown>> {
    const fail = (payload as { fail?: boolean }).fail === true && (context.attempt ?? 1) === 1;

    if (fail) {
      const err = new Error("simulated provider failure") as Error & { code?: string };
      err.code = "provider_error";
      throw err;
    }

    // Simulate provider latency.
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      provider: "mock",
      artifact: `mock-result-${crypto.randomUUID()}`,
      simulated: true,
      room_type: payload.room_type ?? null,
      style: payload.style ?? null,
      output_path: `staged-images/mock/${crypto.randomUUID()}.json`,
      generated_at: new Date().toISOString(),
    };
  }
}
