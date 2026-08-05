import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { accentFor } from "@/lib/utils";
import type { ExtraItem } from "@/lib/types/extra-item";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ExtraItemCard({ extraItem }: { extraItem: ExtraItem }) {
  return (
    <Link href={`/extra-items/${extraItem.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accentFor(extraItem.id)}`}
          >
            <ShoppingBagIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{extraItem.name}</CardTitle>
            <p className="truncate text-xs text-muted-foreground">
              {currencyFormatter.format(extraItem.cost)}
            </p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
