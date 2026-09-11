import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentOrganization, getCurrentUser } from "@/services/organization";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organization = await getCurrentOrganization();

  return (
    <AppShell
      organizationName={organization?.name ?? "Mi organización"}
      subscriptionPlan={organization?.subscriptionPlan ?? null}
      creditsAvailable={organization?.creditsAvailable ?? null}
      userEmail={user.email ?? null}
    >
      {children}
    </AppShell>
  );
}
