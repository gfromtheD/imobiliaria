"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, RefreshDouble, Upload } from "iconoir-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductIcon } from "@/components/ui/product-icon";
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
  const [uploadAttempted, setUploadAttempted] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  function validateFile(candidate: File) {
    if (
      !ALLOWED_IMAGE_MIME.includes(
        candidate.type as (typeof ALLOWED_IMAGE_MIME)[number],
      )
    ) {
      return "La fotografía debe ser JPG o PNG.";
    }
    if (candidate.size > MAX_IMAGE_BYTES) {
      return "La fotografía supera el tamaño máximo de 10 MB.";
    }
    return null;
  }

  function selectFile(candidate: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setUploadError(null);
    if (!candidate) {
      setPreviewUrl(null);
      setFile(null);
      return;
    }

    const fileError = validateFile(candidate);
    if (fileError) {
      setPreviewUrl(null);
      setFile(null);
      setState({ error: fileError, room: null });
      return;
    }

    previewUrlRef.current = URL.createObjectURL(candidate);
    setPreviewUrl(previewUrlRef.current);
    setFile(candidate);
    setState(initialState);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (!state.room && !uploading) {
      selectFile(event.dataTransfer.files?.[0] ?? null);
    }
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
      const form = new FormData();
      form.set("room_type", roomType);
      form.set("file_name", sanitizeFileName(file.name));
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
          upsert: uploadAttempted,
        });

      setUploadAttempted(true);
      if (uploadErrorResult) {
        setUploadError("No se pudo subir la imagen. Pulsa «Reintentar subida».");
        return;
      }

      const finalized = await finalizeRoomUploadAction(
        propertyId,
        room.room_id,
        room.upload_path,
      );

      if (finalized.error) {
        setUploadError(finalized.error);
      }
    } finally {
      setUploading(false);
    }
  }

  const message = state.error ?? uploadError;
  const canChooseFile = !state.room && !uploading;

  return (
    <form action={handleSubmit} className="max-w-xl border-t border-border pt-7" aria-busy={uploading}>
      <div className="grid gap-7">
        <div className="grid gap-2">
          <Label htmlFor="room-type">Tipo de habitación</Label>
          <Select value={roomType} onValueChange={setRoomType} disabled={Boolean(state.room) || uploading}>
            <SelectTrigger id="room-type" className="w-full">
              <SelectValue placeholder="Selecciona una estancia" />
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
              {ROOM_TYPE_DESCRIPTIONS[
                roomType as keyof typeof ROOM_TYPE_DESCRIPTIONS
              ]}
            </p>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="photo">Fotografía original</Label>
            <span className="text-xs text-muted-foreground">JPG o PNG · hasta 10 MB</span>
          </div>
          <Input
            ref={inputRef}
            id="photo"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={!canChooseFile}
            className="sr-only"
            aria-describedby="photo-help"
          />
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (canChooseFile) setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border border-dashed p-4 transition-[border-color,background-color] duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] ${dragActive ? "border-foreground bg-muted" : "border-border bg-muted/35"}`}
          >
            {previewUrl ? (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-end">
                <div className="relative aspect-[4/3] overflow-hidden border border-border bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="" className="size-full object-contain" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ProductIcon icon={Check} className="size-4" />
                    Imagen preparada
                  </p>
                  <p className="mt-2 break-all text-xs leading-relaxed text-muted-foreground">
                    {file?.name}
                  </p>
                  {!state.room && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3 -ml-3"
                      onClick={() => inputRef.current?.click()}
                    >
                      Cambiar imagen
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center px-4 py-8 text-center">
                <div className="flex size-11 items-center justify-center rounded-sm border border-border bg-background">
                  <ProductIcon icon={Camera} className="size-5" />
                </div>
                <p className="mt-5 text-sm font-medium">La fotografía vacía de la estancia</p>
                <p id="photo-help" className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Arrastra una imagen aquí o selecciónala desde tu dispositivo.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  disabled={!canChooseFile}
                  onClick={() => inputRef.current?.click()}
                >
                  <ProductIcon icon={Upload} className="size-3.5" />
                  Seleccionar imagen
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Notas opcionales</Label>
          <Input
            id="notes"
            name="notes"
            placeholder="P. ej.: ventana al este, suelo de parquet"
            disabled={Boolean(state.room) || uploading}
          />
        </div>

        {message && (
          <p
            role="alert"
            className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Button type="submit" disabled={uploading || !roomType || !file}>
            <ProductIcon
              icon={uploading ? RefreshDouble : Upload}
              className={`size-4 ${uploading ? "animate-spin motion-reduce:animate-none" : ""}`}
            />
            {uploading
              ? "Subiendo y preparando…"
              : state.room
                ? "Reintentar subida"
                : "Crear habitación"}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            La imagen original se asociará únicamente a esta habitación.
          </p>
        </div>
      </div>
    </form>
  );
}
