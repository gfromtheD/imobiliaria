"use client";

import { useActionState, useEffect, useState } from "react";

import { FrameAlt, RefreshDouble } from "iconoir-react";

import { Button } from "@/components/ui/button";
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
  createGenerationAction,
  type CreateGenerationState,
} from "@/services/generations";

const initialState: CreateGenerationState = { error: null, generation: null };

export function GenerationForm({
  roomId,
  sourceImageId,
  styles,
  disabled,
  disabledReason,
  onCreated,
}: {
  roomId: string;
  sourceImageId: string | null;
  styles: { id: string; name: string; description: string | null }[];
  disabled: boolean;
  disabledReason: string | null;
  onCreated: () => void;
}) {
  const [styleId, setStyleId] = useState("");
  const [state, formAction, pending] = useActionState(
    (prev: CreateGenerationState, formData: FormData) =>
      createGenerationAction(roomId, prev, formData),
    initialState,
  );

  useEffect(() => {
    if (state.generation) {
      onCreated();
    }
  }, [state.generation, onCreated]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="style_id" value={styleId} />
      <input type="hidden" name="source_image_id" value={sourceImageId ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="style">Estilo de decoración</Label>
        <Select value={styleId} onValueChange={setStyleId}>
          <SelectTrigger id="style">
            <SelectValue placeholder="Selecciona un estilo" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(state.error || disabledReason) && (
        <p role="alert" className="text-sm text-destructive">{state.error ?? disabledReason}</p>
      )}

      <Button type="submit" disabled={pending || disabled || !styleId} className="gap-2">
        <ProductIcon
          icon={pending ? RefreshDouble : FrameAlt}
          className={`size-4 ${pending ? "animate-spin motion-reduce:animate-none" : ""}`}
        />
        {pending ? "Creando generación…" : "Generar decoración"}
      </Button>
    </form>
  );
}
