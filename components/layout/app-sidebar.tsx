import Link from "next/link";
import { Building, Coins, FrameAlt, Settings } from "iconoir-react";

import { SidebarNavLink } from "@/components/layout/sidebar-nav-link";
import { Badge } from "@/components/ui/badge";
import { ProductIcon } from "@/components/ui/product-icon";
import { SUBSCRIPTION_PLAN_LABELS } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function AppSidebar({
  organizationName,
  subscriptionPlan,
  creditsAvailable,
  className,
  onNavigate,
}: {
  organizationName: string;
  subscriptionPlan: string | null;
  creditsAvailable: number | null;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <aside className={cn("flex h-full w-68 shrink-0 flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex min-h-20 items-center border-b border-sidebar-border px-5">
        <Link
          href="/properties"
          className="font-heading text-[1.7rem] leading-none tracking-[-0.07em] outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/30"
        >
          ambivio
        </Link>
      </div>
      <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-3 py-5">
        <SidebarNavLink href="/properties" icon={Building} onNavigate={onNavigate}>
          Propiedades
        </SidebarNavLink>
        <SidebarNavLink href="/generations" icon={FrameAlt} onNavigate={onNavigate}>
          Generaciones
        </SidebarNavLink>
        <SidebarNavLink href="/settings" icon={Settings} onNavigate={onNavigate}>
          Configuración
        </SidebarNavLink>
      </nav>
      <div className="border-t border-sidebar-border px-5 py-5">
        <p className="text-[0.6875rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          Organización
        </p>
        <p className="mt-2 truncate text-sm font-medium">{organizationName}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {subscriptionPlan ? (
            <Badge variant="outline">
              {SUBSCRIPTION_PLAN_LABELS[subscriptionPlan as keyof typeof SUBSCRIPTION_PLAN_LABELS] ??
                subscriptionPlan}
            </Badge>
          ) : null}
          {creditsAvailable !== null ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ProductIcon icon={Coins} className="size-3.5" />
              {creditsAvailable} créditos
            </span>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
