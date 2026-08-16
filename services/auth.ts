"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  success: string | null;
};

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Introduce email y contraseña.", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "Credenciales incorrectas. Revisa email y contraseña.",
      success: null,
    };
  }

  redirect("/properties");
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Introduce email y contraseña.", success: null };
  }
  if (password.length < 8) {
    return {
      error: "La contraseña debe tener al menos 8 caracteres.",
      success: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, success: null };
  }

  if (data.session) {
    redirect("/properties");
  }

  return {
    error: null,
    success: "Cuenta creada. Revisa tu email para confirmar el registro.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Introduce tu email.", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message, success: null };
  }

  return {
    error: null,
    success: "Si la cuenta existe, recibirás un email para restablecer la contraseña.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}