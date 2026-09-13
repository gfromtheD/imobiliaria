import { cn } from "@/lib/utils";

type AmbivioMarkProps = React.ComponentProps<"span"> & {
  variant?: "symbol" | "wordmark" | "lockup";
  tagline?: boolean;
  symbolClassName?: string;
};

export function AmbivioSymbol({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg aria-hidden="true" className={cn("shrink-0", className)} fill="none" focusable="false" viewBox="0 0 64 64" {...props}>
      <path d="M6 32H22C29 32 31 18 40 18H58" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="6" />
      <path d="M6 32H22C29 32 31 46 40 46H58" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="6" />
    </svg>
  );
}

export function AmbivioMark({
  className,
  variant = "lockup",
  tagline = false,
  symbolClassName,
  ...props
}: AmbivioMarkProps) {
  const hasSymbol = variant === "symbol" || variant === "lockup";
  const hasWordmark = variant === "wordmark" || variant === "lockup";

  return (
    <span className={cn("inline-flex items-center", hasSymbol && hasWordmark && "gap-2.5", className)} {...props}>
      {hasSymbol ? <AmbivioSymbol className={cn("size-6", symbolClassName)} /> : null}
      {hasWordmark ? <span className="font-heading text-[1.7rem] font-medium leading-none tracking-[-0.07em]">ambivio</span> : null}
      {tagline ? <span className="ml-1 border-l border-current/30 pl-3 text-[0.625rem] font-medium leading-tight tracking-[0.11em] uppercase">Un espacio. Distintos futuros.</span> : null}
    </span>
  );
}
