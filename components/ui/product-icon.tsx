import * as React from "react";

import { cn } from "@/lib/utils";

export type ProductIconComponent = React.ElementType<
  React.SVGProps<SVGSVGElement>
>;

export function ProductIcon({
  icon: Icon,
  className,
  label,
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "children"> & {
  icon: ProductIconComponent;
  label?: string;
}) {
  return (
    <Icon
      data-slot="product-icon"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
      strokeWidth={1.5}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
