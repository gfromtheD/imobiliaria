import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, organization_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { ...user, role: profile.role, organization_id: profile.organization_id };
}

export type CurrentOrganization = {
  id: string;
  name: string;
  subscriptionPlan: string | null;
  creditsAvailable: number | null;
};

export async function getCurrentOrganization() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", user.organization_id)
    .maybeSingle();

  if (!organization) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, credits_available")
    .eq("organization_id", organization.id)
    .maybeSingle();

  return {
    id: organization.id,
    name: organization.name,
    subscriptionPlan: subscription?.plan ?? null,
    creditsAvailable: subscription?.credits_available ?? null,
  } satisfies CurrentOrganization;
}