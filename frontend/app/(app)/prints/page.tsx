import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintFormDialog } from "@/components/print-form-dialog";
import { PrintsPageContent } from "@/components/prints-page-content";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getPrintCategories, getPrints } from "@/lib/actions/prints";
import type { PrintWithDetails } from "@/lib/types/print";

export default async function PrintsPage() {
  const [printers, filaments, printsRaw, categoryOptions] = await Promise.all([
    getPrinters(),
    getFilaments(),
    getPrints(),
    getPrintCategories(),
  ]);

  const printersById = new Map(printers.map((printer) => [printer.id, printer]));
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));
  const categoriesById = new Map(categoryOptions.map((category) => [category.id, category]));

  const printsWithDetails: PrintWithDetails[] = [...printsRaw]
    .sort((a, b) => {
      const dateA = a.print_date ?? a.created_at;
      const dateB = b.print_date ?? b.created_at;
      return dateB.localeCompare(dateA);
    })
    .map((print) => ({
      ...print,
      category_name:
        print.category_id != null ? (categoriesById.get(print.category_id)?.name ?? null) : null,
      ...printerDenormalizedFields(
        print.printer_id != null ? printersById.get(print.printer_id) : null
      ),
      filaments: print.filaments.map((filament) => ({
        ...filament,
        ...filamentDenormalizedFields(
          filament.filament_id != null ? filamentsById.get(filament.filament_id) : null
        ),
      })),
    }));

  const filamentOptions = await getFilamentOptions();

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const printsByCreatedDesc = [...printsRaw].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const lastPrint = printsByCreatedDesc.find((print) => print.printer_id != null);
  const lastPrintProfit = printsByCreatedDesc.find((print) => print.profit_percent != null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Impressões</h1>
        <PrintFormDialog
          categoryOptions={categoryOptions}
          filamentOptions={filamentOptions}
          printerOptions={printerOptions}
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
