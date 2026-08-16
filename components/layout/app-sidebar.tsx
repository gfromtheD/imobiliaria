import { SidebarNavLink } from "@/components/layout/sidebar-nav-link";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLAN_LABELS } from "@/lib/domain";

export function AppSidebar({
  organizationName,
  subscriptionPlan,
  creditsAvailable,
}: {
  organizationName: string;
  subscriptionPlan: string | null;
  creditsAvailable: number | null;
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-semibold">Virtual Staging</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <SidebarNavLink href="/properties">Propiedades</SidebarNavLink>
        <SidebarNavLink href="/settings">Configuración</SidebarNavLink>
      </nav>
      <div className="border-t p-4">
        <p className="truncate text-sm font-medium">{organizationName}</p>
        <div className="mt-2 flex items-center gap-2">
          {subscriptionPlan && (
            <Badge variant="outline">
              {SUBSCRIPTION_PLAN_LABELS[subscriptionPlan as keyof typeof SUBSCRIPTION_PLAN_LABELS] ??
                subscriptionPlan}
            </Badge>
          )}
          {creditsAvailable !== null && (
            <span className="text-xs text-muted-foreground">
              {creditsAvailable} créditos
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}