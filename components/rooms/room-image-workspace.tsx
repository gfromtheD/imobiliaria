"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  EditPencil,
  RefreshDouble,
  Trash,
  Upload,
} from "iconoir-react";

import { GenerationsSection, type GenerationViewItem } from "@/components/generations/generations-section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ROOM_TYPE_LABELS,
  type RoomType,
} from "@/lib/domain";
import { createClient } from "@/lib/supabase/client";
import {
  createRoomImageUpload,
  deleteRoom,
  deleteRoomImage,
  finalizeRoomImageUpload,
  updateRoom,
} from "@/services/rooms";

type ImageView = {
  id: string;
  status: "pending" | "ready" | "deleting";
  storagePath: string;
  createdAt: string;
  signedUrl: string | null;
};

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_MIME.includes(file.type as (typeof ALLOWED_IMAGE_MIME)[number])) {
    return "La fotografía debe ser JPG o PNG.";
  }
  if (file.size > MAX_IMAGE_BYTES) return "La fotografía supera el tamaño máximo de 10 MB.";
  return null;
}

export function RoomImageWorkspace({
  propertyId,
  roomId,
  roomType,
  notes,
  images,
  styles,
  credits,
  generations,
}: {
  propertyId: string;
  roomId: string;
  roomType: string;
  notes: string | null;
  images: ImageView[];
  styles: { id: string; name: string; description: string | null }[];
  credits: { creditsAvailable: number; creditsReserved: number } | null;
  generations: GenerationViewItem[];
}) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const retryInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    images.find((image) => image.status === "ready")?.id ?? null,
  );
  const [imageToRetry, setImageToRetry] = useState<ImageView | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ImageView | null>(null);
  const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editedType, setEditedType] = useState(roomType);
  const [editedNotes, setEditedNotes] = useState(notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, startSaving] = useTransition();

  const selectedImage =
    images.find(
      (image) => image.id === selectedImageId && image.status === "ready",
    ) ?? images.find((image) => image.status === "ready") ?? null;

  async function uploadToImage(file: File, target: { imageId: string; uploadPath: string }, overwrite: boolean) {
    const validationError = validateImage(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setMessage(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.storage.from("original-images").upload(target.uploadPath, file, {
        contentType: file.type,
        upsert: overwrite,
      });
      if (error) {
        setMessage("No se pudo subir la imagen. Reinténtalo.");
        router.refresh();
        return;
      }
      const finalized = await finalizeRoomImageUpload(target.imageId, target.uploadPath);
      if (finalized.error) {
        setMessage(finalized.error);
        router.refresh();
        return;
      }
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function addImage(file: File) {
    const validationError = validateImage(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setMessage(null);
    setUploading(true);
    try {
      const created = await createRoomImageUpload(roomId, file.name);
      if (created.error || !created.image) {
        setMessage(created.error ?? "No se pudo preparar la imagen.");
        return;
      }
      await uploadToImage(file, { imageId: created.image.image_id, uploadPath: created.image.upload_path }, false);
    } finally {
      setUploading(false);
    }
  }

  function handleNewFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void addImage(file);
  }

  function handleRetryFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file && imageToRetry) {
      void uploadToImage(file, { imageId: imageToRetry.id, uploadPath: imageToRetry.storagePath }, true);
    }
    setImageToRetry(null);
  }

  function saveRoom() {
    setMessage(null);
    startSaving(async () => {
      const result = await updateRoom(roomId, editedType as RoomType, editedNotes);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setEditorOpen(false);
      router.refresh();
    });
  }

  async function confirmImageDelete() {
    if (!imageToDelete) return;
    setDeleting(true);
    setMessage(null);
    const result = await deleteRoomImage(imageToDelete.id);
    setDeleting(false);
    setImageToDelete(null);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    router.refresh();
  }

  async function confirmRoomDelete() {
    setDeleting(true);
    setMessage(null);
    const result = await deleteRoom(roomId);
    setDeleting(false);
    setDeleteRoomOpen(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    router.push(`/properties/${propertyId}/rooms`);
  }

  return (
    <div className="space-y-10">
      <input ref={imageInputRef} className="sr-only" type="file" accept="image/jpeg,image/png" onChange={handleNewFile} />
      <input ref={retryInputRef} className="sr-only" type="file" accept="image/jpeg,image/png" onChange={handleRetryFile} />

      <section className="border-y border-border py-6 sm:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-label">Fotografías originales</p>
            <h2 className="mt-3 text-heading font-medium">Material de esta habitación</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Selecciona una fotografía lista para usarla como origen de la siguiente decoración.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading}>
              <ProductIcon icon={uploading ? RefreshDouble : Upload} className={`size-4 ${uploading ? "animate-spin motion-reduce:animate-none" : ""}`} />
              {uploading ? "Subiendo…" : "Añadir imagen"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditorOpen((open) => !open)}>
              <ProductIcon icon={EditPencil} className="size-3.5" />
              Editar habitación
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteRoomOpen(true)}>
              <ProductIcon icon={Trash} className="size-3.5" />
              Eliminar
            </Button>
          </div>
        </div>

        {editorOpen && (
          <div className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-room-type">Tipo de habitación</Label>
              <Select value={editedType} onValueChange={setEditedType} disabled={saving}>
                <SelectTrigger id="edit-room-type" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{ROOM_TYPES.map((type) => <SelectItem key={type} value={type}>{ROOM_TYPE_LABELS[type]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notas</Label>
              <Input id="edit-notes" value={editedNotes} onChange={(event) => setEditedNotes(event.target.value)} disabled={saving} />
            </div>
            <div className="sm:col-span-2"><Button type="button" size="sm" onClick={saveRoom} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button></div>
          </div>
        )}
      </section>

      {message && <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{message}</p>}

      {images.length === 0 ? (
        <section className="border-y border-border py-14 text-center">
          <div className="mx-auto max-w-md"><ProductIcon icon={Camera} className="mx-auto size-6" /><p className="mt-5 text-heading font-medium">Aún no hay fotografías.</p><p className="mt-2 text-sm text-muted-foreground">Añade una fotografía original para preparar esta habitación.</p></div>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => {
            const isSelected = image.id === selectedImageId;
            const isReady = image.status === "ready";
            return (
              <article key={image.id} className={`group/image border bg-card transition-[border-color,box-shadow,opacity] duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] ${isSelected ? "border-foreground ring-2 ring-ring/20" : "border-border hover:border-foreground/35"} ${image.status === "deleting" ? "opacity-60" : ""}`}>
                <button type="button" className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30" disabled={!isReady} onClick={() => setSelectedImageId(image.id)} aria-pressed={isSelected} aria-label={isReady ? `Seleccionar fotografía ${index + 1} para generar` : `Fotografía ${index + 1}: ${image.status === "pending" ? "subida pendiente" : "eliminándose"}`}>
                  <div className="relative aspect-[4/3] bg-muted">
                    {image.signedUrl ? (
                      // Signed, short-lived private URLs cannot be statically configured for next/image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.signedUrl} alt="" className="size-full object-cover" />
                    ) : <div className="flex size-full flex-col justify-between p-5 text-muted-foreground"><span className="text-[0.625rem] font-medium tracking-[0.14em] uppercase">{image.status === "pending" ? "Subida pendiente" : "Eliminando imagen"}</span><ProductIcon icon={image.status === "pending" ? Upload : RefreshDouble} className={`ml-auto size-6 ${image.status === "deleting" ? "animate-spin motion-reduce:animate-none" : ""}`} /></div>}
                    {isSelected && <span className="absolute left-3 bottom-3 flex items-center gap-1.5 border border-foreground bg-background px-2 py-1 text-xs font-medium"><ProductIcon icon={Check} className="size-3.5" />Seleccionada</span>}
                  </div>
                </button>
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  <span>{image.status === "ready" ? "Lista para generar" : image.status === "pending" ? "Pendiente de subida" : "Limpieza en curso"}</span>
                  {image.status === "ready" ? <Button type="button" variant="ghost" size="icon-xs" aria-label={`Eliminar fotografía ${index + 1}`} onClick={() => setImageToDelete(image)}><ProductIcon icon={Trash} className="size-3.5" /></Button> : image.status === "pending" ? <Button type="button" variant="outline" size="sm" onClick={() => { setImageToRetry(image); retryInputRef.current?.click(); }} disabled={uploading}>Reintentar</Button> : <Button type="button" variant="outline" size="sm" onClick={() => setImageToDelete(image)} disabled={deleting}>Reintentar limpieza</Button>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="border-t border-border pt-8">
        <p className="text-label">Siguiente paso</p>
        <div className="mt-4"><GenerationsSection roomId={roomId} sourceImageId={selectedImage?.id ?? null} originalImageUrl={selectedImage?.signedUrl ?? null} styles={styles} credits={credits} generations={generations} /></div>
      </section>

      <AlertDialog open={Boolean(imageToDelete)} onOpenChange={(open) => !open && setImageToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar esta fotografía?</AlertDialogTitle><AlertDialogDescription>La imagen se eliminará de Storage y de la habitación. No se puede borrar si ya está vinculada a una generación.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction asChild><Button variant="destructive" onClick={() => void confirmImageDelete()} disabled={deleting}>{deleting ? "Eliminando…" : "Eliminar fotografía"}</Button></AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={deleteRoomOpen} onOpenChange={setDeleteRoomOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar esta habitación?</AlertDialogTitle><AlertDialogDescription>Se eliminarán sus imágenes y recursos asociados. Si una limpieza se interrumpe, podrás reintentarla.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction asChild><Button variant="destructive" onClick={() => void confirmRoomDelete()} disabled={deleting}>{deleting ? "Eliminando…" : "Eliminar habitación"}</Button></AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
