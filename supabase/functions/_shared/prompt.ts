// Prompt builder del worker. El prompt es determinista por job (room_type + ai_preset).
// El usuario nunca controla el texto del prompt: se descartan parámetros arbitrarios.

export const PROMPT_VERSION = "v1";

export function buildStagingPrompt(roomType: string, stylePreset: string): string {
  return [
    "Virtual staging de interiorismo profesional para una fotografía inmobiliaria de una habitación vacía.",
    `Tipo de estancia: ${roomType}.`,
    `Estilo: ${stylePreset}.`,
    "Mantén la arquitectura, las ventanas, la iluminación y los ángulos de la fotografía original.",
    "Añade mobiliario, textiles, decoración y vegetación apropiados para el estilo indicado.",
    "Resultado fotorrealista, coherente y listo para marketing inmobiliario.",
  ].join(" ");
}
