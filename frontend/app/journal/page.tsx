import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalFormDialog } from "@/components/journal-form-dialog";
import { JournalPageContent } from "@/components/journal-page-content";
import type {
  JournalAttempt,
  JournalEntryWithDetails,
  JournalEntryWithFilament,
  JournalPhoto,
} from "@/lib/types/journal";
import type { FilamentOption } from "@/lib/types/filament";

export default function JournalPage() {
  const entries = db
    .prepare(
      `SELECT journal_entries.*, filaments.name AS filament_name, filaments.color AS filament_color
       FROM journal_entries
       LEFT JOIN filaments ON journal_entries.filament_id = filaments.id
       ORDER BY journal_entries.entry_date DESC, journal_entries.created_at DESC`
    )
    .all() as JournalEntryWithFilament[];

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

  const filamentOptions = db
    .prepare(
      `SELECT filaments.id, filaments.name, filaments.color, filaments.material,
              filament_brands.name AS brand_name
       FROM filaments
       LEFT JOIN filament_brands ON filaments.brand_id = filament_brands.id
       ORDER BY filaments.name ASC`
    )
    .all() as FilamentOption[];

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
