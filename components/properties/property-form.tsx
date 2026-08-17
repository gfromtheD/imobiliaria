"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPropertyAction,
  updatePropertyAction,
  type PropertyFormState,
} from "@/services/properties";

const initialState: PropertyFormState = { error: null };

export function PropertyForm({
  propertyId,
  initialTitle = "",
  initialAddress = "",
  submitLabel = "Crear propiedad",
}: {
  propertyId?: string;
  initialTitle?: string;
  initialAddress?: string;
  submitLabel?: string;
}) {
  const action = propertyId
    ? updatePropertyAction.bind(null, propertyId)
    : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          placeholder="Piso en el centro"
          defaultValue={initialTitle}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          placeholder="Calle Mayor 12, Madrid"
          defaultValue={initialAddress}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
        <Link href="/properties" className="text-sm text-muted-foreground hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}