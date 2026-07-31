import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { PrintDetailView } from "@/components/print-detail-view";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions } from "@/lib/actions/filaments";
import type {
  Print,
  PrintCategory,
  PrintFilamentWithDetails,
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

  const filaments = db
    .prepare(
      `SELECT print_filaments.*, filaments.name AS filament_name, filaments.color AS filament_color,
              filaments.material AS filament_material,
              filaments.min_price_paid AS filament_min_price_paid,
              filaments.max_price_paid AS filament_max_price_paid
       FROM print_filaments
       LEFT JOIN filaments ON print_filaments.filament_id = filaments.id
       WHERE print_filaments.print_id = ?
       ORDER BY print_filaments.position ASC`
    )
    .all(printId) as PrintFilamentWithDetails[];

  const printWithDetails: PrintWithDetails = { ...print, filaments };

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

  const materialMaxPriceRows = db
    .prepare(
      `SELECT material, MAX(COALESCE(max_price_paid, min_price_paid)) AS max_price
       FROM filaments
       WHERE material IS NOT NULL AND (max_price_paid IS NOT NULL OR min_price_paid IS NOT NULL)
       GROUP BY material`
    )
    .all() as { material: string; max_price: number }[];

  const materialMaxPrices = Object.fromEntries(
    materialMaxPriceRows.map((row) => [row.material, row.max_price])
  );

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
