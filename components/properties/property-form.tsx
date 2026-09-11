"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, RefreshDouble } from "iconoir-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductIcon } from "@/components/ui/product-icon";
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
    <form
      action={formAction}
      className="max-w-xl border-t border-border pt-7"
      aria-busy={pending}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            placeholder="Piso en el centro"
            defaultValue={initialTitle}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            placeholder="Calle Mayor 12, Madrid"
            defaultValue={initialAddress}
          />
        </div>
        {state.error ? (
          <p
            role="alert"
            className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <ProductIcon
                  icon={RefreshDouble}
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
                Guardando…
              </>
            ) : (
              submitLabel
            )}
          </Button>
          <Button asChild variant="ghost">
            <Link href="/properties">
              <ProductIcon icon={ArrowLeft} className="size-4" />
              Cancelar
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
