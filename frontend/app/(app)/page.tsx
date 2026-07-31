import { AlertTriangle, XCircle } from "lucide-react";

import { db } from "@/lib/db";
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
import type {
  Print,
  PrintCategory,
  PrintFilament,
  PrintWithDetails,
} from "@/lib/types/print";
import type { AppSettings } from "@/lib/types/settings";

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

  const printCategoryOptions = db
    .prepare("SELECT * FROM print_categories ORDER BY name ASC")
    .all() as PrintCategory[];

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

  const recentPrintsRaw = db
    .prepare(
      `SELECT prints.*, print_categories.name AS category_name
       FROM prints
       LEFT JOIN print_categories ON prints.category_id = print_categories.id
       ORDER BY COALESCE(prints.print_date, prints.created_at) DESC
       LIMIT 4`
    )
    .all() as (Print & { category_name: string | null })[];

  const recentPrints = recentPrintsRaw.map((print) => ({
    ...print,
    ...printerDenormalizedFields(
      print.printer_id != null ? printersById.get(print.printer_id) : null
    ),
  }));

  const recentPrintIds = recentPrints.map((print) => print.id);
  const recentPrintFilamentsRaw = recentPrintIds.length
    ? (db
        .prepare(
          `SELECT * FROM print_filaments
           WHERE print_id IN (${recentPrintIds.map(() => "?").join(",")})
           ORDER BY print_id ASC, position ASC`
        )
        .all(...recentPrintIds) as PrintFilament[])
    : [];

  const recentPrintFilaments = recentPrintFilamentsRaw.map((printFilament) => ({
    ...printFilament,
    ...filamentDenormalizedFields(
      printFilament.filament_id != null ? filamentsById.get(printFilament.filament_id) : null
    ),
  }));

  const recentFilamentsByPrint = new Map<number, typeof recentPrintFilaments>();
  for (const filament of recentPrintFilaments) {
    const list = recentFilamentsByPrint.get(filament.print_id) ?? [];
    list.push(filament);
    recentFilamentsByPrint.set(filament.print_id, list);
  }

  const recentPrintsWithDetails: PrintWithDetails[] = recentPrints.map((print) => ({
    ...print,
    filaments: recentFilamentsByPrint.get(print.id) ?? [],
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
            defaultProfitPercent={settings.default_profit_percent}
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
