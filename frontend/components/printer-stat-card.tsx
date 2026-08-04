import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const STAT_COLOR_CLASSES = {
  "chart-1": "bg-chart-1/15 text-chart-1",
  "chart-2": "bg-chart-2/15 text-chart-2",
  "chart-3": "bg-chart-3/15 text-chart-3",
  "chart-4": "bg-chart-4/15 text-chart-4",
  "chart-5": "bg-chart-5/15 text-chart-5",
} as const;

export type StatColor = keyof typeof STAT_COLOR_CLASSES;

export function PrinterStatCard({
  icon: Icon,
  label,
  value,
  color,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: StatColor;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          STAT_COLOR_CLASSES[color]
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-base font-semibold">{value}</p>
      </div>
    </div>
  );
}
