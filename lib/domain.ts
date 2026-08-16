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