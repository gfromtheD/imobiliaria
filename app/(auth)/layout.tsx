export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-7xl overflow-hidden border border-border bg-card sm:min-h-[calc(100dvh-2.5rem)] lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(25rem,0.9fr)]">
        <section className="relative hidden flex-col justify-between border-r border-border p-10 lg:flex xl:p-14">
          <p className="font-heading text-[2.15rem] leading-none tracking-[-0.075em]">
            ambivio
          </p>

          <div className="max-w-xl">
            <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Virtual staging inmobiliario
            </p>
            <h2 className="mt-5 font-heading text-display text-foreground">
              Un espacio.<br />
              Distintos futuros.
            </h2>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
              Una herramienta precisa para preparar imágenes inmobiliarias con
              criterio y continuidad.
            </p>
          </div>

          <p className="max-w-sm border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
            La fotografía muestra el espacio. Ambivio organiza el trabajo.
          </p>
        </section>

        <section className="flex min-w-0 items-center px-5 py-12 sm:px-10 lg:px-14 xl:px-18">
          {children}
        </section>
      </div>
    </div>
  );
}
