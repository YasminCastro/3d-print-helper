import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalFormDialog } from "@/components/journal-form-dialog";
import { JournalPageContent } from "@/components/journal-page-content";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getJournalEntries } from "@/lib/actions/journal";
import type { JournalEntryWithDetails } from "@/lib/types/journal";

export default async function JournalPage() {
  const [filaments, entriesRaw] = await Promise.all([getFilaments(), getJournalEntries()]);
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const entriesWithAttempts: JournalEntryWithDetails[] = [...entriesRaw]
    .sort((a, b) => {
      const dateA = a.entry_date ?? a.created_at;
      const dateB = b.entry_date ?? b.created_at;
      return dateB.localeCompare(dateA);
    })
    .map((entry) => ({
      ...entry,
      ...filamentDenormalizedFields(
        entry.filament_id != null ? filamentsById.get(entry.filament_id) : null
      ),
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
