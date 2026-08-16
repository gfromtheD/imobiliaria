import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
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
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        organizationName={organization?.name ?? "Mi organización"}
        subscriptionPlan={organization?.subscriptionPlan ?? null}
        creditsAvailable={organization?.creditsAvailable ?? null}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <SignOutButton />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}