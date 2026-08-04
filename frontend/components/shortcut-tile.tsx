import type { LucideIcon } from "lucide-react";

import { STAT_COLOR_CLASSES, type StatColor } from "@/components/printer-stat-card";
import { cn } from "@/lib/utils";

export function ShortcutTile({
  icon: Icon,
  label,
  description,
  color,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  color: StatColor;
}) {
  return (
    <span className="flex flex-1 min-w-[160px] cursor-pointer items-center gap-3 rounded-xl bg-card p-3 text-left ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          STAT_COLOR_CLASSES[color]
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{description}</span>
      </span>
    </span>
  );
}
