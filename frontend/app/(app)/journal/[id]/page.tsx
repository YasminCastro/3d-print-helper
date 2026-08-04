import { notFound } from "next/navigation";

import { JournalDetailView } from "@/components/journal-detail-view";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getJournalEntry } from "@/lib/actions/journal";
import type { JournalEntryWithDetails } from "@/lib/types/journal";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entryId = Number(id);

  if (Number.isNaN(entryId)) notFound();

  const entryRaw = await getJournalEntry(entryId);

  if (!entryRaw) notFound();

  const [filaments, filamentOptions] = await Promise.all([
    getFilaments(),
    getFilamentOptions(),
  ]);
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const entry: JournalEntryWithDetails = {
    ...entryRaw,
    ...filamentDenormalizedFields(
      entryRaw.filament_id != null ? filamentsById.get(entryRaw.filament_id) : null
    ),
  };

  return <JournalDetailView entry={entry} filamentOptions={filamentOptions} />;
}
