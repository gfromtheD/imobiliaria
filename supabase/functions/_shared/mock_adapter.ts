// MockAdapter — simulates an AI image provider without real API keys.
// Fase 1: produces a real PNG artifact (deterministic per style) that the worker
// uploads to staged-images, so the full pipeline (job -> provider -> storage -> result)
// is exercised end to end. Never used to call OpenAI/FLUX.

export interface MockImageArtifact {
  mime: "image/png";
  base64: string;
  width: number;
  height: number;
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) {
    c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcInput = new Uint8Array(4 + data.length);
  for (let i = 0; i < 4; i++) crcInput[i] = type.charCodeAt(i);
  crcInput.set(data, 4);
  view.setUint32(8 + data.length, crc32(crcInput));
  return out;
}

async function zlibDeflate(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  const reader = cs.readable.getReader();
  const parts: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
  }
  let size = 0;
  for (const p of parts) size += p.length;
  const out = new Uint8Array(size);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rgbFromHash(hash: number): [number, number, number] {
  return [hash & 0xff, (hash >>> 8) & 0xff, (hash >>> 16) & 0xff];
}

// Deterministic 64x48 RGBA render: wall color derived from the style, a "furniture"
// bar along the bottom and a window-like block — enough to prove storage round-trip.
async function renderMockPng(style: string, roomType: string): Promise<MockImageArtifact> {
  const width = 64;
  const height = 48;
  const [r, g, b] = rgbFromHash(fnv1a(style));
  const furnitureRow = Math.floor(height * 0.7);
  const windowX = 8;
  const windowY = 8;
  const windowW = 20;
  const windowH = 16;

  const raw = new Uint8Array(height * (1 + width * 4));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      let pr = r;
      let pg = g;
      let pb = b;
      if (y >= furnitureRow) {
        pr = Math.floor(r * 0.45);
        pg = Math.floor(g * 0.4);
        pb = Math.floor(b * 0.45);
      } else if (x >= windowX && x < windowX + windowW && y >= windowY && y < windowY + windowH) {
        pr = 235;
        pg = 242;
        pb = 248;
      }
      raw[o++] = pr;
      raw[o++] = pg;
      raw[o++] = pb;
      raw[o++] = 255;
    }
  }

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = new Uint8Array(
    8 + chunk("IHDR", ihdr).length + chunk("IDAT", await zlibDeflate(raw)).length + chunk("IEND", new Uint8Array(0)).length,
  );
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  let offset = 8;
  for (const c of [chunk("IHDR", ihdr), chunk("IDAT", await zlibDeflate(raw)), chunk("IEND", new Uint8Array(0))]) {
    png.set(c, offset);
    offset += c.length;
  }

  const base64 = btoa(String.fromCharCode(...png));
  return { mime: "image/png", base64, width, height };
}

export class MockAdapter {
  /**
   * Simulates provider work. If parameters.mock_fail === true and this is the
   * first attempt, throws a controlled transient provider error; a retry succeeds.
   * Otherwise returns a deterministic PNG artifact after a short delay.
   */
  async generate(
    params: { room_type?: string; style?: string; parameters?: Record<string, unknown> },
    context: { attempt?: number } = {},
  ): Promise<MockImageArtifact> {
    const p = params.parameters ?? {};
    const fail = p.mock_fail === true && (context.attempt ?? 1) === 1;

    if (fail) {
      const err = new Error("simulated provider failure") as Error & { code?: string; retryable?: boolean };
      err.code = "provider_error";
      err.retryable = true;
      throw err;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    return await renderMockPng(params.style ?? "modern", params.room_type ?? "otra");
  }
}
