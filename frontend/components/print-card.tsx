import Link from "next/link";
import { BoxIcon, ClockIcon, ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  printResultLabels,
  printStatusLabels,
} from "@/components/print-form-fields";
import { categoryColorClass } from "@/lib/category-colors";
import { filamentIconStyle } from "@/lib/filament-accent";
import type { printResultOptions, printStatusOptions } from "@/lib/schemas/print";
import type { PrintWithDetails } from "@/lib/types/print";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<(typeof printStatusOptions)[number], string> = {
  fila: "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300",
  pronto:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
};

const RESULT_BADGE_CLASSES: Record<(typeof printResultOptions)[number], string> = {
  ruim: "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  razoavel:
    "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300",
  bom: "border-lime-200 bg-lime-100 text-lime-700 dark:border-lime-900 dark:bg-lime-950 dark:text-lime-300",
  perfeito:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
};

const ACCENT_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

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
  const result = print.result as (typeof printResultOptions)[number] | null;
  const iconStyle = filamentIconStyle(print.filaments.map((f) => f.filament_color));

  return (
    <Link href={`/prints/${print.id}`} className="block h-full">
      <Card
        size="sm"
        className="flex h-full flex-col cursor-pointer gap-3 pt-0 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40"
      >
        {print.photo_filename ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/print-photos/${print.id}`}
            alt=""
            className="h-28 w-full object-cover"
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
            <CardTitle className="truncate text-base">{print.name}</CardTitle>
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
            {status && (
              <Badge variant="outline" className={STATUS_BADGE_CLASSES[status]}>
                {printStatusLabels[status]}
              </Badge>
            )}
            {result && (
              <Badge variant="outline" className={RESULT_BADGE_CLASSES[result]}>
                {printResultLabels[result]}
              </Badge>
            )}
            {duration && (
              <Badge variant="secondary">
                <ClockIcon className="size-3" />
                {duration}
              </Badge>
            )}
          </div>
          {print.filaments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              {print.filaments.map((filament) => (
                <span key={filament.position} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full border"
                    style={{ backgroundColor: filament.filament_color ?? "#a1a1aa" }}
                  />
                  {filament.filament_name ?? "—"}
                  {filament.grams != null && ` (${filament.grams}g)`}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
