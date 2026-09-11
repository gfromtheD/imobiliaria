import { LogOut } from "iconoir-react";

import { Button } from "@/components/ui/button";
import { ProductIcon } from "@/components/ui/product-icon";
import { signOutAction } from "@/services/auth";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={compact ? "gap-1.5 px-2.5 text-xs" : "w-full"}
      >
        <ProductIcon icon={LogOut} className="size-3.5" />
        <span className={compact ? "hidden sm:inline" : undefined}>Cerrar sesión</span>
        {compact ? <span className="sr-only sm:hidden">Cerrar sesión</span> : null}
      </Button>
    </form>
  );
}
