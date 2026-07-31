import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintFormDialog } from "@/components/print-form-dialog";
import { PrintsPageContent } from "@/components/prints-page-content";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import type {
  Print,
  PrintCategory,
  PrintFilament,
  PrintWithDetails,
} from "@/lib/types/print";
import type { AppSettings } from "@/lib/types/settings";

export default async function PrintsPage() {
  const printers = await getPrinters();
  const printersById = new Map(printers.map((printer) => [printer.id, printer]));

  const filaments = await getFilaments();
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const printsRaw = db
    .prepare(
      `SELECT prints.*, print_categories.name AS category_name
       FROM prints
       LEFT JOIN print_categories ON prints.category_id = print_categories.id
       ORDER BY COALESCE(prints.print_date, prints.created_at) DESC`
    )
    .all() as (Print & { category_name: string | null })[];

  const prints = printsRaw.map((print) => ({
    ...print,
    ...printerDenormalizedFields(
      print.printer_id != null ? printersById.get(print.printer_id) : null
    ),
  }));

  const printFilamentsRaw = db
    .prepare(
      "SELECT * FROM print_filaments ORDER BY print_id ASC, position ASC"
    )
    .all() as PrintFilament[];

  const printFilaments = printFilamentsRaw.map((printFilament) => ({
    ...printFilament,
    ...filamentDenormalizedFields(
      printFilament.filament_id != null ? filamentsById.get(printFilament.filament_id) : null
    ),
  }));

  const filamentsByPrint = new Map<number, typeof printFilaments>();
  for (const filament of printFilaments) {
    const list = filamentsByPrint.get(filament.print_id) ?? [];
    list.push(filament);
    filamentsByPrint.set(filament.print_id, list);
  }

  const printsWithDetails: PrintWithDetails[] = prints.map((print) => ({
    ...print,
    filaments: filamentsByPrint.get(print.id) ?? [],
  }));

  const categoryOptions = db
    .prepare("SELECT * FROM print_categories ORDER BY name ASC")
    .all() as PrintCategory[];

  const filamentOptions = await getFilamentOptions();

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const settings = db
    .prepare("SELECT * FROM app_settings WHERE id = 1")
    .get() as AppSettings;

  const lastPrint = db
    .prepare(
      "SELECT printer_id FROM prints WHERE printer_id IS NOT NULL ORDER BY created_at DESC LIMIT 1"
    )
    .get() as { printer_id: number } | undefined;

  const lastPrintProfit = db
    .prepare(
      "SELECT profit_percent FROM prints WHERE profit_percent IS NOT NULL ORDER BY created_at DESC LIMIT 1"
    )
    .get() as { profit_percent: number } | undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Impressões</h1>
        <PrintFormDialog
          categoryOptions={categoryOptions}
          filamentOptions={filamentOptions}
          printerOptions={printerOptions}
          defaultProfitPercent={settings.default_profit_percent}
          lastPrinterId={lastPrint?.printer_id}
          lastProfitPercent={lastPrintProfit?.profit_percent}
        />
      </div>

      {printsWithDetails.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma impressão cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <PrintsPageContent prints={printsWithDetails} categoryOptions={categoryOptions} />
      )}
    </div>
  );
}
