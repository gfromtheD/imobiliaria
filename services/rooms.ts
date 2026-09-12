"use server";

import { redirect } from "next/navigation";

import { ROOM_TYPES, sanitizeFileName, type RoomType } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomImageRow = Database["public"]["Tables"]["room_images"]["Row"];

const ALLOWED_FILE_NAME = /^[A-Za-z0-9._-]+\.(jpg|jpeg|png)$/;

export type CreateRoomResult = {
  room_id: string;
  room_type: string;
  image_id: string;
  upload_path: string;
};

export type CreateRoomImageResult = {
  image_id: string;
  room_id: string;
  upload_path: string;
  status: "pending";
};

export type CreateRoomState = { error: string | null; room: CreateRoomResult | null };

type RoomDeletionPlan = {
  deletion_id: string;
  original_paths: string[];
  staged_paths: string[];
};

function mapRoomRpcError(errorMessage: string | null) {
  if (!errorMessage) return "No se pudo completar la operación. Inténtalo de nuevo.";
  if (errorMessage.includes("property_not_found")) return "La propiedad no existe.";
  if (errorMessage.includes("room_limit_reached")) return "Máximo 20 estancias por propiedad.";
  if (errorMessage.includes("image_limit_reached")) return "Máximo 20 imágenes por propiedad.";
  if (errorMessage.includes("invalid_room_type")) return "El tipo de habitación no es válido.";
  if (errorMessage.includes("invalid_file_type")) return "El archivo debe ser JPG o PNG.";
  if (errorMessage.includes("upload_not_found")) return "La imagen aún no está disponible. Reintenta la subida.";
  if (errorMessage.includes("already_uploaded")) return "La imagen ya estaba confirmada.";
  if (errorMessage.includes("image_has_generations")) return "No se puede borrar una imagen que ya tiene generaciones.";
  if (errorMessage.includes("room_generation_in_progress")) return "Espera a que termine la generación antes de borrar la estancia.";
  if (errorMessage.includes("storage_cleanup_incomplete")) return "La limpieza de archivos no ha terminado. Reinténtalo.";
  if (errorMessage.includes("not_authenticated")) return "Debes iniciar sesión para continuar.";
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

function validateFileName(rawFileName: string) {
  const fileName = sanitizeFileName(rawFileName);
  return ALLOWED_FILE_NAME.test(fileName) ? fileName : null;
}

export async function listRooms(propertyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, room_type, original_image_path, notes, created_at")
    .eq("property_id", propertyId)
    .is("deletion_requested_at", null)
    .order("created_at", { ascending: true });
  if (error) throw new Error("No se pudieron cargar las habitaciones.", { cause: error });
  return data;
}

export async function getRoom(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, property_id, room_type, original_image_path, notes, created_at, deletion_requested_at")
    .eq("id", roomId)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar la habitación.", { cause: error });
  return data as (RoomRow & { property_id: string }) | null;
}

/** Lists pending, ready, and deleting image records for upload recovery. */
export async function listRoomImages(roomId: string): Promise<RoomImageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_images")
    .select("id, organization_id, room_id, storage_path, status, created_at, ready_at, updated_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("No se pudieron cargar las imágenes de la habitación.", { cause: error });
  return (data ?? []) as RoomImageRow[];
}

export async function getRoomImageSignedUrl(roomImageId: string) {
  const supabase = await createClient();
  const { data: image, error: imageError } = await supabase
    .from("room_images")
    .select("storage_path")
    .eq("id", roomImageId)
    .eq("status", "ready")
    .maybeSingle();
  if (imageError) throw new Error("No se pudo cargar la imagen.", { cause: imageError });
  if (!image) return null;
  const { data, error } = await supabase.storage.from("original-images").createSignedUrl(image.storage_path, 3600);
  if (error) throw new Error("No se pudo generar la imagen.", { cause: error });
  return data.signedUrl;
}

/** Transitional helper for existing Room pages: returns the first ready image. */
export async function getRoomImageUrl(roomId: string) {
  const images = await listRoomImages(roomId);
  const image = images.find((candidate) => candidate.status === "ready");
  return image ? getRoomImageSignedUrl(image.id) : null;
}

/** Compatibility action for the deployed one-image Room form. */
export async function createRoomAction(
  propertyId: string,
  _prevState: CreateRoomState,
  formData: FormData,
): Promise<CreateRoomState> {
  void _prevState;
  const roomType = String(formData.get("room_type") ?? "");
  const rawFileName = String(formData.get("file_name") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!ROOM_TYPES.includes(roomType as RoomType)) return { error: "Selecciona un tipo de habitación.", room: null };
  const fileName = validateFileName(rawFileName);
  if (!fileName) return { error: "Selecciona una fotografía JPG o PNG.", room: null };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_room", {
    p_property_id: propertyId,
    p_room_type: roomType,
    p_file_name: fileName,
    p_notes: notes || undefined,
  });
  if (error) return { error: mapRoomRpcError(error.message), room: null };
  const result = data as unknown as CreateRoomResult;
  if (!result?.room_id || !result.image_id || !result.upload_path) {
    return { error: "Respuesta inesperada del servidor. Inténtalo de nuevo.", room: null };
  }
  return { error: null, room: result };
}

/** New contract: creates a Room with zero images. */
export async function createRoom(propertyId: string, roomType: RoomType, notes = "") {
  if (!ROOM_TYPES.includes(roomType)) return { error: "El tipo de habitación no es válido.", roomId: null };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_room", {
    p_property_id: propertyId,
    p_room_type: roomType,
    p_file_name: undefined,
    p_notes: notes.trim() || undefined,
  });
  if (error) return { error: mapRoomRpcError(error.message), roomId: null };
  const result = data as unknown as { room_id?: string };
  return result?.room_id
    ? { error: null, roomId: result.room_id }
    : { error: "Respuesta inesperada del servidor. Inténtalo de nuevo.", roomId: null };
}

/** Creates a pending image record and deterministic private upload path for an existing Room. */
export async function createRoomImageUpload(roomId: string, rawFileName: string) {
  const fileName = validateFileName(rawFileName);
  if (!fileName) return { error: "El archivo debe ser JPG o PNG.", image: null };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_room_image", { p_room_id: roomId, p_file_name: fileName });
  if (error) return { error: mapRoomRpcError(error.message), image: null };
  const image = data as unknown as CreateRoomImageResult;
  if (!image?.image_id || !image.upload_path) return { error: "Respuesta inesperada del servidor. Inténtalo de nuevo.", image: null };
  return { error: null, image };
}

export async function finalizeRoomImageUpload(roomImageId: string, uploadPath: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("finalize_room_image_upload", {
    p_room_image_id: roomImageId,
    p_upload_path: uploadPath,
  });
  return { error: error ? mapRoomRpcError(error.message) : null };
}

/** Compatibility wrapper consumed by the current visual upload form. */
export async function finalizeRoomUploadAction(
  propertyId: string,
  roomId: string,
  uploadPath: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("finalize_room_upload", { p_room_id: roomId, p_upload_path: uploadPath });
  if (error) return { error: mapRoomRpcError(error.message) };
  redirect(`/properties/${propertyId}/rooms/${roomId}`);
}

export async function updateRoom(roomId: string, roomType: RoomType, notes: string) {
  if (!ROOM_TYPES.includes(roomType)) return { error: "El tipo de habitación no es válido.", room: null };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("update_room", {
    p_room_id: roomId,
    p_room_type: roomType,
    p_notes: notes.trim() || undefined,
  });
  return { error: error ? mapRoomRpcError(error.message) : null, room: data as RoomRow | null };
}

async function removePaths(bucket: "original-images" | "staged-images", paths: string[]) {
  if (paths.length === 0) return null;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  return error ? "No se pudieron limpiar los archivos. Reinténtalo." : null;
}

/** Marks an image deleting, removes its private object, then verifies and deletes its DB row. Safe to retry. */
export async function deleteRoomImage(roomImageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("prepare_room_image_deletion", { p_room_image_id: roomImageId });
  if (error) return { error: mapRoomRpcError(error.message) };
  const plan = data as { storage_path?: string };
  if (!plan?.storage_path) return { error: "Respuesta inesperada del servidor. Inténtalo de nuevo." };
  const cleanupError = await removePaths("original-images", [plan.storage_path]);
  if (cleanupError) return { error: cleanupError };
  const { error: completionError } = await supabase.rpc("complete_room_image_deletion", { p_room_image_id: roomImageId });
  return { error: completionError ? mapRoomRpcError(completionError.message) : null };
}

/** Idempotent Room deletion; an interrupted Storage cleanup remains visible and resumable. */
export async function deleteRoom(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("prepare_room_deletion", { p_room_id: roomId });
  if (error) return { error: mapRoomRpcError(error.message) };
  const plan = data as unknown as RoomDeletionPlan;
  if (!plan?.deletion_id || !Array.isArray(plan.original_paths) || !Array.isArray(plan.staged_paths)) {
    return { error: "Respuesta inesperada del servidor. Inténtalo de nuevo." };
  }
  const originalsError = await removePaths("original-images", plan.original_paths);
  if (originalsError) return { error: originalsError };
  const stagedError = await removePaths("staged-images", plan.staged_paths);
  if (stagedError) return { error: stagedError };
  const { error: completionError } = await supabase.rpc("complete_room_deletion", { p_deletion_id: plan.deletion_id });
  return { error: completionError ? mapRoomRpcError(completionError.message) : null };
}
