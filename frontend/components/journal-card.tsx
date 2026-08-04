"use client";

import Link from "next/link";
import { NotebookTextIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { journalStatusLabels } from "@/components/journal-form-fields";
import type { journalStatusOptions } from "@/lib/schemas/journal";
import type { JournalEntryWithDetails } from "@/lib/types/journal";

const STATUS_BADGE_CLASSES: Record<(typeof journalStatusOptions)[number], string> = {
  resolvido:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  nao_resolvido:
    "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  em_andamento:
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

export function JournalCard({ entry }: { entry: JournalEntryWithDetails }) {
  const status = entry.status as (typeof journalStatusOptions)[number] | null;
  const date = formatDate(entry.entry_date);

  return (
    <Link href={`/journal/${entry.id}`} className="block h-full">
      <Card
        size="sm"
        className="flex h-full cursor-pointer flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40"
      >
        {entry.photos.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/journal-photos/${entry.photos[0].id}`}
            alt=""
            className="h-28 w-full object-cover"
          />
        )}
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              !entry.filament_color && accentFor(entry.id)
            )}
            style={
              entry.filament_color
                ? { backgroundColor: `${entry.filament_color}26`, color: entry.filament_color }
                : undefined
            }
          >
            <NotebookTextIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{entry.title}</CardTitle>
            {entry.filament_name && (
              <p className="truncate text-xs text-muted-foreground">{entry.filament_name}</p>
            )}
          </div>
        </CardHeader>

        {(status || date) && (
          <CardContent className="mt-auto flex flex-wrap items-center gap-1.5">
            {status && (
              <Badge variant="outline" className={STATUS_BADGE_CLASSES[status]}>
                {journalStatusLabels[status]}
              </Badge>
            )}
            {date && <Badge variant="secondary">{date}</Badge>}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
