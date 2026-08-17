"use client";

import { useActionState } from "react";

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
import { deletePropertyAction, type PropertyFormState } from "@/services/properties";

const initialState: PropertyFormState = { error: null };

export function DeletePropertyButton({ propertyId, title }: { propertyId: string; title: string }) {
  const [state, formAction, pending] = useActionState(
    deletePropertyAction.bind(null, propertyId),
    initialState,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Eliminar</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar «{title}»?</AlertDialogTitle>
          <AlertDialogDescription>
            La propiedad y sus habitaciones se eliminarán de forma permanente.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={formAction}>
            <AlertDialogAction asChild>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Eliminando…" : "Eliminar"}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}