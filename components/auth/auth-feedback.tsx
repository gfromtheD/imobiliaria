import { CheckCircle, WarningCircle } from "iconoir-react";

import { ProductIcon } from "@/components/ui/product-icon";

export function AuthFeedback({
  error,
  success,
}: {
  error: string | null;
  success: string | null;
}) {
  const message = error ?? success;

  if (!message) return null;

  const isError = Boolean(error);

  return (
    <p
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={
        isError
          ? "flex items-start gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          : "flex items-start gap-2 rounded-sm border border-emerald-700/25 bg-emerald-700/5 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-200"
      }
    >
      <ProductIcon
        icon={isError ? WarningCircle : CheckCircle}
        className="mt-0.5 size-4 shrink-0"
      />
      <span>{message}</span>
    </p>
  );
}
