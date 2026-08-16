"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthState } from "@/services/auth";

const initialState: AuthState = { error: null, success: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <AuthCard title="Iniciar sesión" description="Accede a tu cuenta de la agencia.">
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
            autoComplete="current-password"
            required
          />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/register" className="text-muted-foreground hover:underline">
          Crear cuenta
        </Link>
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthCard>
  );
}