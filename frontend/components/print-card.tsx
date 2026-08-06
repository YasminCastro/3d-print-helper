import Link from "next/link";
import { BoxIcon, CheckCircle2, ClockIcon, CoinsIcon, HourglassIcon, ImageIcon, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingImage } from "@/components/loading-image";
import {
  printStatusColors,
  printStatusLabels,
} from "@/components/print-form-fields";
import { categoryColorClass } from "@/lib/category-colors";
import { colorSwatch, filamentIconStyle } from "@/lib/filament-accent";
import type { printStatusOptions } from "@/lib/schemas/print";
import type { PrintWithDetails } from "@/lib/types/print";
import { cn } from "@/lib/utils";

const statusIcons: Record<(typeof printStatusOptions)[number], typeof CheckCircle2> = {
  fila: HourglassIcon,
  pronto: CheckCircle2,
};

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

export function PrintCard({ print }: { print: PrintWithDetails }) {
  const duration = formatDuration(print.duration_minutes);
  const status = print.status as (typeof printStatusOptions)[number] | null;
  const iconStyle = filamentIconStyle(
    print.filaments.map((f) => colorSwatch(f.filament_color, f.filament_color2))
  );
  const totalGrams = print.filaments.reduce((sum, filament) => sum + (filament.grams ?? 0), 0);
  const isActualSaleValue = print.sale_value_actual != null;
  const displaySaleValue = print.sale_value_actual ?? print.sale_value_worst_case;

  return (
    <Link href={`/prints/${print.id}`} className="block h-full">
      <Card
        size="sm"
        className="flex h-full flex-col cursor-pointer gap-3 pt-0 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40"
      >
        {print.photo_filename ? (
          <LoadingImage
            src={`/print-photos/${print.id}`}
            className="h-28 w-full rounded-t-xl"
            imgClassName="object-cover"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-t-xl bg-muted">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
        )}
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              !iconStyle && accentFor(print.id)
            )}
            style={iconStyle}
          >
            <BoxIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CardTitle className="truncate text-base">{print.name}</CardTitle>
              {status && (
                <span title={printStatusLabels[status]}>
                  {(() => {
                    const StatusIcon = statusIcons[status];
                    return (
                      <StatusIcon className={cn("size-4 shrink-0", printStatusColors[status])} />
                    );
                  })()}
                </span>
              )}
            </div>
            {print.category_name && (
              <Badge
                variant="outline"
                className={cn("mt-1 w-fit border-transparent", categoryColorClass(print.category_name))}
              >
                {print.category_name}
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
                className={
                  isActualSaleValue
                    ? "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                    : "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300"
                }
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
