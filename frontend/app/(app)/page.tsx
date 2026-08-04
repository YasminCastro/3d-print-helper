import { AlertTriangle, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  availabilityLabels,
  availabilityColors,
} from "@/components/filament-form-fields";
import { FilamentFormDialog } from "@/components/filament-form-dialog";
import { CalibrationFormDialog } from "@/components/calibration-form-dialog";
import { JournalFormDialog } from "@/components/journal-form-dialog";
import { PrintFormDialog } from "@/components/print-form-dialog";
import { PrintCard } from "@/components/print-card";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getBrands } from "@/lib/actions/brands";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getPrintCategories, getPrints } from "@/lib/actions/prints";
import type { PrintWithDetails } from "@/lib/types/print";

const alertIcons: Record<
  "indisponivel" | "quase_acabando",
  typeof AlertTriangle
> = {
  indisponivel: XCircle,
  quase_acabando: AlertTriangle,
};

const alertRowStyles: Record<"indisponivel" | "quase_acabando", string> = {
  indisponivel: "border-red-500 bg-red-50 dark:bg-red-950/30",
  quase_acabando: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
};

const alertIconColors: Record<"indisponivel" | "quase_acabando", string> = {
  indisponivel: "text-red-800 dark:text-red-500",
  quase_acabando: "text-yellow-800 dark:text-yellow-500",
};

export default async function Home() {
  const printers = await getPrinters();
  const printersById = new Map(printers.map((printer) => [printer.id, printer]));

  const filaments = await getFilaments();
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const alerts = [...filaments]
    .filter((filament) => filament.availability === "indisponivel" || filament.availability === "quase_acabando")
    .sort((a, b) =>
      a.availability === b.availability
        ? a.name.localeCompare(b.name)
        : (a.availability ?? "").localeCompare(b.availability ?? "")
    );

  const brands = await getBrands();
  const brandOptions = [...brands]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((brand) => ({ id: brand.id, name: brand.name }));

  const filamentOptions = await getFilamentOptions();

  const [printCategoryOptions, printsRaw] = await Promise.all([
    getPrintCategories(),
    getPrints(),
  ]);
  const categoriesById = new Map(printCategoryOptions.map((category) => [category.id, category]));

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const printsByCreatedDesc = [...printsRaw].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const lastPrint = printsByCreatedDesc.find((print) => print.printer_id != null);
  const lastPrintProfit = printsByCreatedDesc.find((print) => print.profit_percent != null);

  const recentPrintsWithDetails: PrintWithDetails[] = [...printsRaw]
    .sort((a, b) => {
      const dateA = a.print_date ?? a.created_at;
      const dateB = b.print_date ?? b.created_at;
      return dateB.localeCompare(dateA);
    })
    .slice(0, 4)
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atalhos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <FilamentFormDialog brandOptions={brandOptions} />
          <CalibrationFormDialog filamentOptions={filamentOptions} />
          <JournalFormDialog filamentOptions={filamentOptions} />
          <PrintFormDialog
            categoryOptions={printCategoryOptions}
            filamentOptions={filamentOptions}
            printerOptions={printerOptions}
            lastPrinterId={lastPrint?.printer_id}
            lastProfitPercent={lastPrintProfit?.profit_percent}
          />
        </CardContent>
      </Card>

      {recentPrintsWithDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas impressões</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentPrintsWithDetails.map((print) => (
              <PrintCard key={print.id} print={print} />
            ))}
          </CardContent>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alertas de filamento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {alerts.map((filament) => {
              const availability = filament.availability as
                | "indisponivel"
                | "quase_acabando";
              const Icon = alertIcons[availability];

              return (
                <div
                  key={filament.id}
                  className={`flex items-center gap-2 rounded-md border-l-4 p-2 text-sm ${alertRowStyles[availability]}`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${alertIconColors[availability]}`}
                  />
                  <span className="flex-1">{filament.name}</span>
                  <span className={availabilityColors[availability]}>
                    {availabilityLabels[availability]}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
