import { Building } from "iconoir-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  ProductIcon,
  type ProductIconComponent,
} from "@/components/ui/product-icon";

export function EmptyState({
  icon = Building,
  title,
  description,
  action,
}: {
  icon?: ProductIconComponent;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-sm border border-border bg-muted">
          <ProductIcon icon={icon} className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
