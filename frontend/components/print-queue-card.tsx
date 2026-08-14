import Link from "next/link";
import { BoxIcon, ClockIcon, CoinsIcon, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryColorClass } from "@/lib/category-colors";
import { colorSwatch, filamentIconStyle } from "@/lib/filament-accent";
import type { PrintQueueItemWithDetails } from "@/lib/types/print-queue";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function accentFor(id: number) {
  return ACCENT_CLASSES[id % ACCENT_CLASSES.length];
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

export function PrintQueueCard({ queueItem }: { queueItem: PrintQueueItemWithDetails }) {
  const duration = formatDuration(queueItem.duration_minutes);
  const iconStyle = filamentIconStyle(
    queueItem.filaments.map((f) => colorSwatch(f.filament_color, f.filament_color2))
  );
  const totalGrams = queueItem.filaments.reduce((sum, filament) => sum + (filament.grams ?? 0), 0);
  const displaySaleValue = queueItem.sale_value_worst_case ?? queueItem.sale_value;

  return (
    <Link href={`/print-queue/${queueItem.id}`} className="block h-full">
      <Card
        size="sm"
        className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40"
      >
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              !iconStyle && accentFor(queueItem.id)
            )}
            style={iconStyle}
          >
            <BoxIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{queueItem.name}</CardTitle>
            {queueItem.category_name && (
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 w-fit border-transparent",
                  categoryColorClass(queueItem.category_name)
                )}
              >
                {queueItem.category_name}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-auto flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {duration && (
              <Badge variant="secondary">
                <ClockIcon className="size-3" />
                {duration}
              </Badge>
            )}
            {totalGrams > 0 && (
              <Badge variant="secondary">
                <Scale className="size-3" />
                {totalGrams}g
              </Badge>
            )}
            {displaySaleValue != null && (
              <Badge
                variant="outline"
                className="border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300"
              >
                <CoinsIcon className="size-3" />
                {currencyFormatter.format(displaySaleValue)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
