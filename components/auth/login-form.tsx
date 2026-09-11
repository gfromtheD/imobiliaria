"use client";

import Link from "next/link";
import { useActionState } from "react";
import { RefreshDouble } from "iconoir-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductIcon } from "@/components/ui/product-icon";
import { loginAction, type AuthState } from "@/services/auth";

const initialState: AuthState = { error: null, success: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <AuthCard title="Iniciar sesión" description="Accede al espacio de trabajo de tu inmobiliaria.">
      <form action={formAction} className="grid gap-5" aria-busy={pending}>
        <div className="grid gap-2">
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
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <AuthFeedback error={state.error} success={state.success} />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <ProductIcon icon={RefreshDouble} className="size-4 animate-spin motion-reduce:animate-none" />
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Link href="/register" className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--motion-duration-control)] hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
          Crear cuenta
        </Link>
        <Link
          href="/forgot-password"
          className="font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--motion-duration-control)] hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthCard>
  );
}
