"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationDetailsDialog } from "@/components/calibration-details-dialog";
import {
  calibrationStatusColors,
  calibrationStatusLabels,
  slicerLabels,
} from "@/components/calibration-form-fields";
import type { calibrationStatusOptions, slicerOptions } from "@/lib/schemas/calibration";
import type { CalibrationWithFilament } from "@/lib/types/calibration";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function CalibrationCard({
  calibration,
  filamentOptions,
}: {
  calibration: CalibrationWithFilament;
  filamentOptions: { id: number; name: string; color: string | null }[];
}) {
  const [open, setOpen] = useState(false);
  const slicer = calibration.slicer as (typeof slicerOptions)[number];
  const status = calibration.status as (typeof calibrationStatusOptions)[number] | null;
  const date = formatDate(calibration.calibration_date);

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="cursor-pointer transition hover:ring-primary/40"
      >
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <span
              className="size-4 shrink-0 rounded-full border"
              style={{ backgroundColor: calibration.filament_color ?? "#a1a1aa" }}
            />
            {calibration.filament_name ?? "—"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Gauge className="size-4 shrink-0" />
            {slicerLabels[slicer]}
          </span>
          {(status || date) && (
            <span className="flex items-center gap-2">
              {status && (
                <span className={calibrationStatusColors[status]}>
                  {calibrationStatusLabels[status]}
                </span>
              )}
              {date && <span>{date}</span>}
            </span>
          )}
        </CardContent>
      </Card>
      <CalibrationDetailsDialog
        calibration={calibration}
        filamentOptions={filamentOptions}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
