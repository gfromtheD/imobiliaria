import Link from "next/link";

import { AmbivioMark } from "@/components/brand/ambivio-mark";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full max-w-md" aria-labelledby="auth-title">
      <Link
        href="/login"
        aria-label="Ambivio · ir a iniciar sesión"
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:hidden"
      >
        <AmbivioMark symbolClassName="size-6" />
      </Link>
      <p className="mt-10 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase lg:mt-0">
        Área privada
      </p>
      <h1 id="auth-title" className="mt-3 text-title font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 border-t border-border pt-6">{children}</div>
    </section>
  );
}
