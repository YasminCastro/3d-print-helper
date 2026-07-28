"use client";

import { useState } from "react";
import { NotebookTextIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalDetailsDialog } from "@/components/journal-details-dialog";
import {
  journalStatusColors,
  journalStatusLabels,
} from "@/components/journal-form-fields";
import type { journalStatusOptions } from "@/lib/schemas/journal";
import type { JournalEntryWithDetails } from "@/lib/types/journal";
import type { FilamentOption } from "@/lib/types/filament";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function JournalCard({
  entry,
  filamentOptions,
}: {
  entry: JournalEntryWithDetails;
  filamentOptions: FilamentOption[];
}) {
  const [open, setOpen] = useState(false);
  const status = entry.status as (typeof journalStatusOptions)[number] | null;
  const date = formatDate(entry.entry_date);

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
        size="sm"
        className="cursor-pointer transition hover:ring-primary/40"
      >
        {entry.photos.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/uploads/journal/${entry.photos[0].filename}`}
            alt=""
            className="h-28 w-full object-cover"
          />
        )}
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <NotebookTextIcon className="size-4 shrink-0" />
            {entry.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          {entry.filament_name && (
            <span className="flex items-center gap-1.5">
              <span
                className="size-3.5 shrink-0 rounded-full border"
                style={{ backgroundColor: entry.filament_color ?? "#a1a1aa" }}
              />
              {entry.filament_name}
            </span>
          )}
          {(status || date) && (
            <span className="flex items-center gap-2">
              {status && (
                <span className={journalStatusColors[status]}>
                  {journalStatusLabels[status]}
                </span>
              )}
              {date && <span>{date}</span>}
            </span>
          )}
        </CardContent>
      </Card>
      <JournalDetailsDialog
        entry={entry}
        filamentOptions={filamentOptions}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
