"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProductIcon, type ProductIconComponent } from "@/components/ui/product-icon";
import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  icon,
  onNavigate,
  children,
}: {
  href: string;
  icon: ProductIconComponent;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group/sidebar-link flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium outline-none transition-[color,background-color,box-shadow] duration-[var(--motion-duration-control)] ease-[var(--motion-ease-out)] focus-visible:ring-2 focus-visible:ring-sidebar-ring/30",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <ProductIcon icon={icon} className="size-4.5" />
      {children}
    </Link>
  );
}
