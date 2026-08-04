import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { STAT_COLOR_CLASSES, type StatColor } from "@/components/printer-stat-card";

export function FieldIcon({
  icon: Icon,
  color,
}: {
  icon: LucideIcon;
  color: StatColor;
}) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        STAT_COLOR_CLASSES[color]
      )}
    >
      <Icon className="size-3.5" />
    </span>
  );
}
