"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  ROOM_TYPES,
  ROOM_TYPE_DESCRIPTIONS,
  ROOM_TYPE_LABELS,
  sanitizeFileName,
} from "@/lib/domain";
import { createClient } from "@/lib/supabase/client";
import {
  createRoomAction,
  finalizeRoomUploadAction,
  type CreateRoomState,
} from "@/services/rooms";

const initialState: CreateRoomState = { error: null, room: null };

export function RoomUploadForm({ propertyId }: { propertyId: string }) {
  const [roomType, setRoomType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<CreateRoomState>(initialState);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (selected) {
      previewUrlRef.current = URL.createObjectURL(selected);
    }
    setPreviewUrl(previewUrlRef.current);
    setFile(selected);
  }

  function validateFile(candidate: File) {
    if (!ALLOWED_IMAGE_MIME.includes(candidate.type as (typeof ALLOWED_IMAGE_MIME)[number])) {
      return "La fotografía debe ser JPG o PNG.";
    }
    if (candidate.size > MAX_IMAGE_BYTES) {
      return "La fotografía supera el tamaño máximo de 10 MB.";
    }
    return null;
  }

  async function handleSubmit(formData: FormData) {
    setUploadError(null);

    if (!file) {
      setState({ error: "Selecciona una fotografía (JPG o PNG).", room: null });
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      setState({ error: fileError, room: null });
      return;
    }

    let room = state.room;
    if (!room) {
      const fileName = sanitizeFileName(file.name);

      const form = new FormData();
      form.set("room_type", roomType);
      form.set("file_name", fileName);
      form.set("notes", String(formData.get("notes") ?? ""));

      const created = await createRoomAction(propertyId, state, form);

      if (created.error || !created.room) {
        setState(created);
        return;
      }

      room = created.room;
      setState({ error: null, room });
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { error: uploadErrorResult } = await supabase.storage
        .from("original-images")
        .upload(room.upload_path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErrorResult) {
        setUploadError(
          "No se pudo subir la imagen. Pulsa «Reintentar subida».",
        );
        return;
      }

      const finalized = await finalizeRoomUploadAction(
        propertyId,
        room.room_id,
        room.upload_path,
      );

      if (finalized.error) {
        setUploadError(finalized.error);
        return;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="room-type">Tipo de habitación</Label>
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger id="room-type">
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {ROOM_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {ROOM_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {roomType && (
          <p className="text-xs text-muted-foreground">
            {ROOM_TYPE_DESCRIPTIONS[roomType as keyof typeof ROOM_TYPE_DESCRIPTIONS]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Fotografía de la habitación vacía</Label>
        <Input
          id="photo"
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">
          JPG o PNG, máximo 10 MB.
        </p>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Vista previa de la habitación"
            className="mt-2 max-h-48 rounded-md border object-cover"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input
          id="notes"
          name="notes"
          placeholder="P.ej.: ventana al este, suelo de parquet"
        />
      </div>

      {(state.error || uploadError) && (
        <p className="text-sm text-destructive">{state.error ?? uploadError}</p>
      )}

      <Button type="submit" disabled={uploading || !roomType || !file}>
        {uploading
          ? "Subiendo…"
          : state.room
            ? "Reintentar subida"
            : "Crear habitación"}
      </Button>
    </form>
  );
}