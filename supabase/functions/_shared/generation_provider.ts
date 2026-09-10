// Contrato interno de Ambivio para proveedores de virtual staging.
// No contiene tipos, SDKs ni credenciales de un proveedor concreto.

export const GENERATION_PROVIDER_CONTRACT_VERSION = "v1";

// These are the formats accepted by Ambivio's private Storage buckets today.
export type ImageMimeType = "image/jpeg" | "image/png";

export interface OriginalImageReference {
  bucket: "original-images";
  path: string;
}

export interface ImageArtifact {
  bytes: Uint8Array;
  mime: ImageMimeType;
  width?: number;
  height?: number;
}

/**
 * The loader stays inside the Edge worker. Adapters may request bytes when they
 * need them, but receive neither a public URL nor storage credentials.
 */
export interface OriginalImageAccess {
  reference: OriginalImageReference;
  load: () => Promise<ImageArtifact>;
}

export interface FidelityPolicy {
  version: "v1";
  invariants: readonly string[];
  editable: readonly string[];
  conditional: readonly string[];
}

export interface ResolvedGenerationInstructions {
  prompt: string;
  promptVersion: string;
  presetId: string;
  presetVersion: string;
  roomType: string;
  fidelityPolicy: FidelityPolicy;
}

export interface GenerationInput {
  generationId: string;
  attempt: number;
  originalImage: OriginalImageAccess;
  instructions: ResolvedGenerationInstructions;
  /** Server-controlled, allow-listed options only. Empty in the product MVP. */
  parameters: Readonly<Record<string, unknown>>;
}

export interface GenerationResult {
  image: ImageArtifact;
  provider: string;
  model: string;
  providerCostEstimate: number;
  metadata?: Readonly<Record<string, string | number | boolean>>;
}

export interface SubmittedGeneration {
  status: "submitted";
  providerJobId: string;
  pollAfterSeconds?: number;
  metadata?: Readonly<Record<string, string | number | boolean>>;
}

export interface CompletedGeneration {
  status: "completed";
  result: GenerationResult;
}

export type GenerationSubmission = SubmittedGeneration | CompletedGeneration;

export interface GenerationPollInput {
  generationId: string;
  providerJobId: string;
}

export type GenerationPollResult = SubmittedGeneration | CompletedGeneration;

export interface ProviderAdapter {
  readonly provider: string;
  submit(input: GenerationInput): Promise<GenerationSubmission>;
}

export interface PollingProviderAdapter extends ProviderAdapter {
  poll(input: GenerationPollInput): Promise<GenerationPollResult>;
}

export function supportsPolling(adapter: ProviderAdapter): adapter is PollingProviderAdapter {
  return "poll" in adapter && typeof (adapter as Partial<PollingProviderAdapter>).poll === "function";
}

export class ProviderError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  /** True when the caller cannot know whether the provider accepted the request. */
  readonly ambiguousSubmission: boolean;
  readonly terminal: boolean;

  constructor(
    code: string,
    message: string,
    options: { retryable?: boolean; ambiguousSubmission?: boolean; terminal?: boolean } = {},
  ) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.terminal = options.terminal ?? false;
    this.retryable = this.terminal ? false : (options.retryable ?? true);
    this.ambiguousSubmission = options.ambiguousSubmission ?? false;
  }
}
