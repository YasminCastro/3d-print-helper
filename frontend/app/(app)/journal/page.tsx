import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalFormDialog } from "@/components/journal-form-dialog";
import { JournalPageContent } from "@/components/journal-page-content";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import type {
  JournalAttempt,
  JournalEntry,
  JournalEntryWithDetails,
  JournalPhoto,
} from "@/lib/types/journal";

export default async function JournalPage() {
  const filaments = await getFilaments();
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const entriesRaw = db
    .prepare(
      "SELECT * FROM journal_entries ORDER BY entry_date DESC, created_at DESC"
    )
    .all() as JournalEntry[];

  const entries = entriesRaw.map((entry) => ({
    ...entry,
    ...filamentDenormalizedFields(
      entry.filament_id != null ? filamentsById.get(entry.filament_id) : null
    ),
  }));

  const attempts = db
    .prepare("SELECT * FROM journal_attempts ORDER BY entry_id ASC, position ASC")
    .all() as JournalAttempt[];

  const attemptsByEntry = new Map<number, JournalAttempt[]>();
  for (const attempt of attempts) {
    const list = attemptsByEntry.get(attempt.entry_id) ?? [];
    list.push(attempt);
    attemptsByEntry.set(attempt.entry_id, list);
  }

  const photos = db
    .prepare("SELECT * FROM journal_photos ORDER BY entry_id ASC, created_at ASC")
    .all() as JournalPhoto[];

  const photosByEntry = new Map<number, JournalPhoto[]>();
  for (const photo of photos) {
    const list = photosByEntry.get(photo.entry_id) ?? [];
    list.push(photo);
    photosByEntry.set(photo.entry_id, list);
  }

  const entriesWithAttempts: JournalEntryWithDetails[] = entries.map((entry) => ({
    ...entry,
    attempts: attemptsByEntry.get(entry.id) ?? [],
    photos: photosByEntry.get(entry.id) ?? [],
  }));

  const filamentOptions = await getFilamentOptions();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Diário</h1>
        <JournalFormDialog filamentOptions={filamentOptions} />
      </div>

      {entriesWithAttempts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma entrada de diário cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <JournalPageContent
          entries={entriesWithAttempts}
          filamentOptions={filamentOptions}
        />
      )}
    </div>
  );
}
