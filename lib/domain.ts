export const ROOM_TYPES = [
  "salón",
  "dormitorio",
  "cocina",
  "baño",
  "comedor",
  "despacho",
  "terraza",
  "exterior",
  "otra",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  salón: "Salón",
  dormitorio: "Dormitorio",
  cocina: "Cocina",
  baño: "Baño",
  comedor: "Comedor",
  despacho: "Despacho",
  terraza: "Terraza",
  exterior: "Exterior",
  otra: "Otra",
};

export const ROOM_TYPE_DESCRIPTIONS: Record<RoomType, string> = {
  salón: "Sala de estar o salón principal.",
  dormitorio: "Habitación para dormir.",
  cocina: "Cocina.",
  baño: "Cuarto de baño.",
  comedor: "Comedor independiente.",
  despacho: "Oficina o despacho.",
  terraza: "Terraza o balcón.",
  exterior: "Espacio exterior (jardín, fachada…).",
  otra: "Cualquier otra estancia.",
};

export const MAX_ROOMS_PER_PROPERTY = 20;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png"] as const;

export function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

export const GENERATION_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
] as const;

export type GenerationStatus = (typeof GENERATION_STATUSES)[number];

export const GENERATION_STATUS_LABELS: Record<GenerationStatus, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completada",
  failed: "Fallida",
  cancelled: "Cancelada",
};

export const PROPERTY_STATUSES = ["active", "archived"] as const;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const USER_ROLES = ["owner", "agent"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SUBSCRIPTION_PLANS = ["free", "basic", "pro"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Gratis",
  basic: "Básico",
  pro: "Pro",
};