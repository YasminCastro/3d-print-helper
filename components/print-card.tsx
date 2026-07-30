import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { printStatusDotColors } from "@/components/print-form-fields";
import { categoryColorClass } from "@/lib/category-colors";
import type { printStatusOptions } from "@/lib/schemas/print";
import type { PrintWithDetails } from "@/lib/types/print";
import { cn } from "@/lib/utils";

function formatDuration(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

export function PrintCard({ print }: { print: PrintWithDetails }) {
  const duration = formatDuration(print.duration_minutes);
  const status = print.status as (typeof printStatusOptions)[number] | null;
  const hasDetails = print.filaments.length > 0 || duration || print.category_name;

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
          <CardTitle className="flex items-center gap-2 text-base">
            {status && (
              <span
                className={cn("size-2.5 shrink-0 rounded-full", printStatusDotColors[status])}
              />
            )}
            {print.name}
          </CardTitle>
        </CardHeader>
        {hasDetails && (
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            {print.category_name && (
              <span className="flex items-center gap-2">
                <span className="size-2.5 shrink-0" />
                <Badge
                  variant="outline"
                  className={cn("w-fit border-transparent", categoryColorClass(print.category_name))}
                >
                  {print.category_name}
                </Badge>
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-2">
                <span className="size-2.5 shrink-0" />
                {duration}
              </span>
            )}
            {print.filaments.length > 0 && (
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {print.filaments.map((filament) => (
                  <span key={filament.id} className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full border"
                      style={{ backgroundColor: filament.filament_color ?? "#a1a1aa" }}
                    />
                    {filament.filament_name ?? "—"}
                    {filament.grams != null && ` (${filament.grams}g)`}
                  </span>
                ))}
              </span>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
