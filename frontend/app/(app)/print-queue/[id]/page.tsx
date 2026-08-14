import { notFound } from "next/navigation";

import { PrintQueueDetailView } from "@/components/print-queue-detail-view";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments, getFilamentPricingData } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getExtraItems } from "@/lib/actions/extra-items";
import { extraItemDenormalizedFields } from "@/lib/extra-item-helpers";
import { getPrintCategories } from "@/lib/actions/prints";
import { getPrintQueueItem } from "@/lib/actions/print-queue";
import type { PrintQueueItemWithDetails } from "@/lib/types/print-queue";

export default async function PrintQueueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queueItemId = Number(id);

  if (Number.isNaN(queueItemId)) notFound();

  const [printers, filaments, extraItems, queueItemRaw, categoryOptions] = await Promise.all([
    getPrinters(),
    getFilaments(),
    getExtraItems(),
    getPrintQueueItem(queueItemId),
    getPrintCategories(),
  ]);

  if (!queueItemRaw) notFound();

  const printersById = new Map(printers.map((printer) => [printer.id, printer]));
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));
  const extraItemsById = new Map(extraItems.map((extraItem) => [extraItem.id, extraItem]));
  const categoriesById = new Map(categoryOptions.map((category) => [category.id, category]));

  const queueItemWithDetails: PrintQueueItemWithDetails = {
    ...queueItemRaw,
    category_name:
      queueItemRaw.category_id != null
        ? (categoriesById.get(queueItemRaw.category_id)?.name ?? null)
        : null,
    ...printerDenormalizedFields(
      queueItemRaw.printer_id != null ? printersById.get(queueItemRaw.printer_id) : null
    ),
    filaments: queueItemRaw.filaments.map((filament) => ({
      ...filament,
      ...filamentDenormalizedFields(
        filament.filament_id != null ? filamentsById.get(filament.filament_id) : null
      ),
    })),
    extraItems: queueItemRaw.extraItems.map((extraItem) => ({
      ...extraItem,
      ...extraItemDenormalizedFields(
        extraItem.extra_item_id != null ? extraItemsById.get(extraItem.extra_item_id) : null
      ),
    })),
  };

  const filamentOptions = await getFilamentOptions();

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const { materialMaxPrices } = await getFilamentPricingData();

  return (
    <PrintQueueDetailView
      queueItem={queueItemWithDetails}
      categoryOptions={categoryOptions}
      filamentOptions={filamentOptions}
      printerOptions={printerOptions}
      extraItemOptions={extraItems}
      materialMaxPrices={materialMaxPrices}
    />
  );
}
