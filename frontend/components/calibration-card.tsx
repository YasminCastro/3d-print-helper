import Link from "next/link";
import { Gauge } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  calibrationStatusLabels,
  slicerLabels,
} from "@/components/calibration-form-fields";
import { filamentTypeColors, filamentTypeLabels } from "@/components/brand-form-fields";
import { filamentIconStyle } from "@/lib/filament-accent";
import type { calibrationStatusOptions, slicerOptions } from "@/lib/schemas/calibration";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import type { CalibrationWithFilament } from "@/lib/types/calibration";

const STATUS_BADGE_CLASSES: Record<(typeof calibrationStatusOptions)[number], string> = {
  calibrado:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  nao_calibrado:
    "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  em_processo:
    "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300",
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

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function CalibrationCard({ calibration }: { calibration: CalibrationWithFilament }) {
  const slicer = calibration.slicer as (typeof slicerOptions)[number];
  const status = calibration.status as (typeof calibrationStatusOptions)[number] | null;
  const material = calibration.filament_material as
    | (typeof filamentTypeOptions)[number]
    | null;
  const date = formatDate(calibration.calibration_date);
  const iconStyle = filamentIconStyle([calibration.filament_color]);

  return (
    <Link href={`/calibrations/${calibration.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              !iconStyle && accentFor(calibration.id)
            )}
            style={iconStyle}
          >
            <Gauge className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              {calibration.filament_name ?? "—"}
            </CardTitle>
            <p className="truncate text-xs text-muted-foreground">{slicerLabels[slicer]}</p>
          </div>
        </CardHeader>

        {(status || material || date) && (
          <CardContent className="mt-auto flex flex-wrap items-center gap-1.5">
            {status && (
              <Badge variant="outline" className={STATUS_BADGE_CLASSES[status]}>
                {calibrationStatusLabels[status]}
              </Badge>
            )}
            {material && (
              <Badge variant="outline" className={filamentTypeColors[material]}>
                {filamentTypeLabels[material] ?? material}
              </Badge>
            )}
            {date && <Badge variant="secondary">{date}</Badge>}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
