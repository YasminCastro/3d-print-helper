import { notFound } from "next/navigation";

import { PrintDetailView } from "@/components/print-detail-view";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments, getFilamentPricingData } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getPrint, getPrintCategories } from "@/lib/actions/prints";
import type { PrintWithDetails } from "@/lib/types/print";

export default async function PrintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const printId = Number(id);

  if (Number.isNaN(printId)) notFound();

  const [printers, filaments, printRaw, categoryOptions] = await Promise.all([
    getPrinters(),
    getFilaments(),
    getPrint(printId),
    getPrintCategories(),
  ]);

  if (!printRaw) notFound();

  const printersById = new Map(printers.map((printer) => [printer.id, printer]));
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));
  const categoriesById = new Map(categoryOptions.map((category) => [category.id, category]));

  const printWithDetails: PrintWithDetails = {
    ...printRaw,
    category_name:
      printRaw.category_id != null
        ? (categoriesById.get(printRaw.category_id)?.name ?? null)
        : null,
    ...printerDenormalizedFields(
      printRaw.printer_id != null ? printersById.get(printRaw.printer_id) : null
    ),
    filaments: printRaw.filaments.map((filament) => ({
      ...filament,
      ...filamentDenormalizedFields(
        filament.filament_id != null ? filamentsById.get(filament.filament_id) : null
      ),
    })),
  };

  const filamentOptions = await getFilamentOptions();

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const { materialMaxPrices } = await getFilamentPricingData();

  return (
    <PrintDetailView
      print={printWithDetails}
      categoryOptions={categoryOptions}
      filamentOptions={filamentOptions}
      printerOptions={printerOptions}
      materialMaxPrices={materialMaxPrices}
    />
  );
}
