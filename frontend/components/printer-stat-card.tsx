import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const STAT_COLOR_CLASSES = {
  "chart-1": "bg-chart-1/15 text-chart-1",
  "chart-2": "bg-chart-2/15 text-chart-2",
  "chart-3": "bg-chart-3/15 text-chart-3",
  "chart-4": "bg-chart-4/15 text-chart-4",
  "chart-5": "bg-chart-5/15 text-chart-5",
  green: "bg-green-500/15 text-green-600 dark:text-green-400",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  yellow: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  lime: "bg-lime-500/15 text-lime-600 dark:text-lime-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  pink: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  orange: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  teal: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  indigo: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  gray: "bg-muted text-muted-foreground",
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
  value: ReactNode;
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
        <div className="truncate text-base font-semibold">{value}</div>
      </div>
    </div>
  );
}
