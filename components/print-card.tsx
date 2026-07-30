import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  printResultColors,
  printResultLabels,
  printStatusColors,
  printStatusLabels,
} from "@/components/print-form-fields";
import type { printResultOptions, printStatusOptions } from "@/lib/schemas/print";
import type { PrintWithDetails } from "@/lib/types/print";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

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
  const hasDetails =
    print.print_date ||
    print.filaments.length > 0 ||
    duration ||
    status ||
    result ||
    print.category_name;

  return (
    <Link href={`/prints/${print.id}`}>
      <Card
        size="sm"
        className="cursor-pointer transition hover:ring-primary/40"
      >
        {print.photo_filename ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/uploads/prints/${print.photo_filename}`}
            alt=""
            className="h-28 w-full object-cover"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-t-xl bg-muted">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-base">{print.name}</CardTitle>
        </CardHeader>
        {hasDetails && (
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            {print.category_name && <span>{print.category_name}</span>}
            {print.filaments.length > 0 && (
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {print.filaments.map((filament) => (
                  <span key={filament.id} className="flex items-center gap-1.5">
                    <span
                      className="size-3 shrink-0 rounded-full border"
                      style={{ backgroundColor: filament.filament_color ?? "#a1a1aa" }}
                    />
                    {filament.filament_name ?? "—"}
                  </span>
                ))}
              </span>
            )}
            {print.print_date && (
              <span>{dateFormatter.format(new Date(print.print_date))}</span>
            )}
            {duration && <span>{duration}</span>}
            {(status || result) && (
              <span className="flex items-center gap-2">
                {status && (
                  <span className={printStatusColors[status]}>
                    {printStatusLabels[status]}
                  </span>
                )}
                {result && (
                  <span className={printResultColors[result]}>
                    {printResultLabels[result]}
                  </span>
                )}
              </span>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
