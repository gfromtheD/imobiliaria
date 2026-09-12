"use client";

import { useState, useTransition } from "react";
import { ArrowRight, RefreshDouble } from "iconoir-react";
import { useRouter } from "next/navigation";

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
  ROOM_TYPES,
  ROOM_TYPE_DESCRIPTIONS,
  ROOM_TYPE_LABELS,
  type RoomType,
} from "@/lib/domain";
import { createRoom } from "@/services/rooms";

export function RoomCreateForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [roomType, setRoomType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createRoom(propertyId, roomType as RoomType, notes);
      if (result.error || !result.roomId) {
        setError(result.error ?? "No se pudo crear la habitación.");
        return;
      }
      router.push(`/properties/${propertyId}/rooms/${result.roomId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl border-t border-border pt-7" aria-busy={pending}>
      <div className="grid gap-7">
        <div className="grid gap-2">
          <Label htmlFor="room-type">Tipo de habitación</Label>
          <Select value={roomType} onValueChange={setRoomType} disabled={pending}>
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
              {ROOM_TYPE_DESCRIPTIONS[roomType as RoomType]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Notas opcionales</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="P. ej.: ventana al este, suelo de parquet"
            disabled={pending}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Podrás añadir las fotografías originales en el siguiente paso.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending || !roomType}>
          <ProductIcon icon={pending ? RefreshDouble : ArrowRight} className={`size-4 ${pending ? "animate-spin motion-reduce:animate-none" : ""}`} />
          {pending ? "Creando habitación…" : "Continuar a las fotografías"}
        </Button>
      </div>
    </form>
  );
}
