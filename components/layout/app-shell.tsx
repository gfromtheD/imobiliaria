"use client";

import { useState } from "react";
import { Menu, User, Xmark } from "iconoir-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";

type AppShellProps = {
  children: React.ReactNode;
  organizationName: string;
  subscriptionPlan: string | null;
  creditsAvailable: number | null;
  userEmail: string | null;
};

export function AppShell({
  children,
  organizationName,
  subscriptionPlan,
  creditsAvailable,
  userEmail,
}: AppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  const sidebarProps = {
    organizationName,
    subscriptionPlan,
    creditsAvailable,
    onNavigate: () => setMobileNavigationOpen(false),
  };

  return (
    <div className="min-h-dvh bg-muted/35">
      <div className="grid min-h-dvh lg:grid-cols-[17rem_minmax(0,1fr)]">
        <AppSidebar
          {...sidebarProps}
          className="hidden border-r border-sidebar-border lg:flex"
        />

        <div className="flex min-w-0 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <DialogPrimitive.Root
                open={mobileNavigationOpen}
                onOpenChange={setMobileNavigationOpen}
              >
                <DialogPrimitive.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Abrir navegación"
                  >
                    <ProductIcon icon={Menu} className="size-5" />
                  </Button>
                </DialogPrimitive.Trigger>
                <DialogPrimitive.Portal>
                  <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25 supports-backdrop-filter:backdrop-blur-xs data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:backdrop-blur-none" />
                  <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-2rem))] origin-left bg-sidebar shadow-ambivio outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none">
                    <DialogPrimitive.Title className="sr-only">
                      Navegación principal
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="sr-only">
                      Accesos a propiedades, generaciones y configuración.
                    </DialogPrimitive.Description>
                    <DialogPrimitive.Close asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 z-10"
                        aria-label="Cerrar navegación"
                      >
                        <ProductIcon icon={Xmark} className="size-5" />
                      </Button>
                    </DialogPrimitive.Close>
                    <AppSidebar {...sidebarProps} />
                  </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
              </DialogPrimitive.Root>

              <span className="font-heading text-[1.45rem] leading-none tracking-[-0.065em] lg:hidden">
                ambivio
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="hidden min-w-0 items-center gap-2 border-r pr-3 text-sm text-muted-foreground sm:flex">
                <ProductIcon icon={User} className="size-4" />
                <span className="max-w-52 truncate">{userEmail}</span>
              </div>
              <SignOutButton compact />
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
