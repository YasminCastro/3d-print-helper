import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { PrintDetailView } from "@/components/print-detail-view";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments, getFilamentPricingData } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import type {
  Print,
  PrintCategory,
  PrintFilament,
  PrintWithDetails,
} from "@/lib/types/print";
import type { AppSettings } from "@/lib/types/settings";

export default async function PrintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const printId = Number(id);

  if (Number.isNaN(printId)) notFound();

  const printers = await getPrinters();
  const printersById = new Map(printers.map((printer) => [printer.id, printer]));

  const filaments = await getFilaments();
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const printRaw = db
    .prepare(
      `SELECT prints.*, print_categories.name AS category_name
       FROM prints
       LEFT JOIN print_categories ON prints.category_id = print_categories.id
       WHERE prints.id = ?`
    )
    .get(printId) as (Print & { category_name: string | null }) | undefined;

  if (!printRaw) notFound();

  const print = {
    ...printRaw,
    ...printerDenormalizedFields(
      printRaw.printer_id != null ? printersById.get(printRaw.printer_id) : null
    ),
  };

  const printFilamentsRaw = db
    .prepare(
      "SELECT * FROM print_filaments WHERE print_id = ? ORDER BY position ASC"
    )
    .all(printId) as PrintFilament[];

  const printFilaments = printFilamentsRaw.map((printFilament) => ({
    ...printFilament,
    ...filamentDenormalizedFields(
      printFilament.filament_id != null ? filamentsById.get(printFilament.filament_id) : null
    ),
  }));

  const printWithDetails: PrintWithDetails = { ...print, filaments: printFilaments };

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

  const { materialMaxPrices } = await getFilamentPricingData();

  return (
    <PrintDetailView
      print={printWithDetails}
      categoryOptions={categoryOptions}
      filamentOptions={filamentOptions}
      printerOptions={printerOptions}
      defaultProfitPercent={settings.default_profit_percent}
      materialMaxPrices={materialMaxPrices}
    />
  );
}
