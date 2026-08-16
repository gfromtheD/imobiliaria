import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function listProperties() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, address, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar las propiedades.", { cause: error });
  }

  return data;
}