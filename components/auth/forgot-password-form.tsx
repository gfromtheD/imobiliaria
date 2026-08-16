"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type AuthState } from "@/services/auth";

const initialState: AuthState = { error: null, success: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <AuthCard
      title="Restablecer contraseña"
      description="Te enviaremos un email para restablecerla."
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
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando…" : "Enviar email"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthCard>
  );
}