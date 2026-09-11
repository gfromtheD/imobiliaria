import Link from "next/link";

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
        className="font-heading text-[1.85rem] leading-none tracking-[-0.075em] outline-none focus-visible:ring-2 focus-visible:ring-ring/30 lg:hidden"
      >
        ambivio
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
