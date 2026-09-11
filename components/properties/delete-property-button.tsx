"use client";

import { useActionState } from "react";
import { RefreshDouble, Trash } from "iconoir-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { deletePropertyAction, type PropertyFormState } from "@/services/properties";

const initialState: PropertyFormState = { error: null };

export function DeletePropertyButton({
  propertyId,
  title,
}: {
  propertyId: string;
  title: string;
}) {
  const [state, formAction, pending] = useActionState(
    deletePropertyAction.bind(null, propertyId),
    initialState,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <ProductIcon icon={Trash} className="size-3.5" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{title}»?</AlertDialogTitle>
          <AlertDialogDescription>
            La propiedad y sus habitaciones se eliminarán de forma permanente.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.error && (
          <p
            className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={formAction}>
            <AlertDialogAction asChild>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              aria-busy={pending}
            >
                {pending && (
                  <ProductIcon
                    icon={RefreshDouble}
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                )}
                {pending ? "Eliminando…" : "Eliminar"}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
