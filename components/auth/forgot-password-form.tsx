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
        <AuthFeedback error={state.error} success={state.success} />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <ProductIcon icon={RefreshDouble} className="size-4 animate-spin motion-reduce:animate-none" />
              Enviando…
            </>
          ) : (
            "Enviar email"
          )}
        </Button>
      </form>
      <div className="mt-6 border-t border-border pt-5 text-center text-sm">
        <Link href="/login" className="font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--motion-duration-control)] hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthCard>
  );
}
