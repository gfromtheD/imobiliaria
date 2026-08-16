import { Button } from "@/components/ui/button";
import { signOutAction } from "@/services/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" size="sm" className="w-full">
        Cerrar sesión
      </Button>
    </form>
  );
}