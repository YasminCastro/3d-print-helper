import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { PrintDetailView } from "@/components/print-detail-view";
import type {
  PrintCategory,
  PrintFilamentWithDetails,
  PrintWithCategory,
  PrintWithDetails,
} from "@/lib/types/print";
import type { FilamentOption } from "@/lib/types/filament";
import type { AppSettings } from "@/lib/types/settings";

export default async function PrintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const printId = Number(id);

  if (Number.isNaN(printId)) notFound();

  const print = db
    .prepare(
      `SELECT prints.*, print_categories.name AS category_name,
              printers.name AS printer_name,
              printers.power_consumption_w AS printer_power_consumption_w,
              printers.energy_cost_per_kwh AS printer_energy_cost_per_kwh,
              printers.maintenance_cost_per_hour AS printer_maintenance_cost_per_hour
       FROM prints
       LEFT JOIN print_categories ON prints.category_id = print_categories.id
       LEFT JOIN printers ON prints.printer_id = printers.id
       WHERE prints.id = ?`
    )
    .get(printId) as PrintWithCategory | undefined;

  if (!print) notFound();

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

  const filamentOptions = db
    .prepare(
      `SELECT filaments.id, filaments.name, filaments.color, filaments.material,
              filament_brands.name AS brand_name
       FROM filaments
       LEFT JOIN filament_brands ON filaments.brand_id = filament_brands.id
       ORDER BY filaments.name ASC`
    )
    .all() as FilamentOption[];

  const printerOptions = db
    .prepare("SELECT id, name FROM printers ORDER BY name ASC")
    .all() as { id: number; name: string }[];

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
