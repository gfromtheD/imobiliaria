"use server";

import { redirect } from "next/navigation";

import { ROOM_TYPES, sanitizeFileName, type RoomType } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];

const ALLOWED_FILE_NAME = /^[A-Za-z0-9._-]+\.(jpg|jpeg|png)$/;

export type CreateRoomResult = {
  room_id: string;
  upload_path: string;
  room_type: string;
};

export type CreateRoomState = {
  error: string | null;
  room: CreateRoomResult | null;
};

function mapRoomRpcError(errorMessage: string | null) {
  if (!errorMessage) return "No se pudo crear la habitación. Inténtalo de nuevo.";
  if (errorMessage.includes("property_not_found")) return "La propiedad no existe.";
  if (errorMessage.includes("image_limit_reached"))
    return "Máximo 20 habitaciones por propiedad.";
  if (errorMessage.includes("invalid_room_type"))
    return "El tipo de habitación no es válido.";
  if (errorMessage.includes("invalid_file_type"))
    return "El archivo debe ser JPG o PNG.";
  if (errorMessage.includes("not_authenticated"))
    return "Debes iniciar sesión para continuar.";
  return "No se pudo crear la habitación. Inténtalo de nuevo.";
}

export async function listRooms(propertyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, room_type, original_image_path, notes, created_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las habitaciones.", { cause: error });
  }

  return data;
}

export async function getRoom(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, property_id, room_type, original_image_path, notes, created_at")
    .eq("id", roomId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la habitación.", { cause: error });
  }

  return data as (RoomRow & { property_id: string }) | null;
}

export async function getRoomImageUrl(roomId: string) {
  const room = await getRoom(roomId);
  if (!room?.original_image_path) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("original-images")
    .createSignedUrl(room.original_image_path, 3600);

  if (error) {
    throw new Error("No se pudo generar la imagen.", { cause: error });
  }

  return data.signedUrl;
}

export async function createRoomAction(
  propertyId: string,
  _prevState: CreateRoomState,
  formData: FormData,
): Promise<CreateRoomState> {
  void _prevState;

  const roomType = String(formData.get("room_type") ?? "");
  const rawFileName = String(formData.get("file_name") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!ROOM_TYPES.includes(roomType as RoomType)) {
    return { error: "Selecciona un tipo de habitación.", room: null };
  }

  if (!rawFileName) {
    return { error: "Selecciona una fotografía (JPG o PNG).", room: null };
  }

  const fileName = sanitizeFileName(rawFileName);
  if (!ALLOWED_FILE_NAME.test(fileName)) {
    return { error: "El nombre del archivo no es válido. Renómbralo y prueba de nuevo.", room: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_room", {
    p_property_id: propertyId,
    p_room_type: roomType,
    p_file_name: fileName,
    p_notes: notes || undefined,
  });

  if (error) {
    return { error: mapRoomRpcError(error.message), room: null };
  }

  const result = data as unknown as CreateRoomResult;
  if (!result?.room_id || !result?.upload_path) {
    return { error: "Respuesta inesperada del servidor. Inténtalo de nuevo.", room: null };
  }

  return { error: null, room: result };
}

export async function finalizeRoomUploadAction(
  propertyId: string,
  roomId: string,
  uploadPath: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("finalize_room_upload", {
    p_room_id: roomId,
    p_upload_path: uploadPath,
  });

  if (error) {
    return {
      error: "No se pudo confirmar la imagen. Inténtalo de nuevo.",
    };
  }

  redirect(`/properties/${propertyId}/rooms/${roomId}`);
}