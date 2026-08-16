"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type AuthState } from "@/services/auth";

const initialState: AuthState = { error: null, success: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <AuthCard
      title="Crear cuenta"
      description="Crea la cuenta de tu agencia. La organización se configura automáticamente."
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@agencia.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres.
          </p>
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:underline">
          ¿Ya tienes cuenta? Entra
        </Link>
      </div>
    </AuthCard>
  );
}