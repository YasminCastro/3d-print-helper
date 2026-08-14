import { Suspense } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintQueueFormDialog } from "@/components/print-queue-form-dialog";
import { PrintQueuePageContent } from "@/components/print-queue-page-content";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getExtraItems } from "@/lib/actions/extra-items";
import { extraItemDenormalizedFields } from "@/lib/extra-item-helpers";
import { getPrintCategories } from "@/lib/actions/prints";
import { getPrintQueueItems } from "@/lib/actions/print-queue";
import { printQueueSortOptions, type PrintQueueSortOption } from "@/lib/schemas/print-queue";
import type { PrintQueueItemWithDetails } from "@/lib/types/print-queue";

const DEFAULT_SORT: PrintQueueSortOption = "newest";

function parseSort(raw: string | undefined): PrintQueueSortOption {
  return (printQueueSortOptions as readonly string[]).includes(raw ?? "")
    ? (raw as PrintQueueSortOption)
    : DEFAULT_SORT;
}

function toArray(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export default async function PrintQueuePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
    categoryId?: string | string[];
    printerId?: string | string[];
  }>;
}) {
  const {
    page: pageParam,
    sort: sortParam,
    search: searchParam,
    categoryId: categoryIdParam,
    printerId: printerIdParam,
  } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const sort = parseSort(sortParam);
  const search = searchParam?.trim() || undefined;
  const categoryIds = toArray(categoryIdParam)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  const printerIds = toArray(printerIdParam)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  const hasActiveFilters = Boolean(search) || categoryIds.length > 0 || printerIds.length > 0;

  const [printers, filaments, extraItems, queueResult, categoryOptions] = await Promise.all([
    getPrinters(),
    getFilaments(),
    getExtraItems(),
    getPrintQueueItems({ page, sort, search, categoryIds, printerIds }),
    getPrintCategories(),
  ]);

  const queueItemsRaw = queueResult.items;

  const printersById = new Map(printers.map((printer) => [printer.id, printer]));
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));
  const extraItemsById = new Map(extraItems.map((extraItem) => [extraItem.id, extraItem]));
  const categoriesById = new Map(categoryOptions.map((category) => [category.id, category]));

  const queueItemsWithDetails: PrintQueueItemWithDetails[] = queueItemsRaw.map((queueItem) => ({
    ...queueItem,
    category_name:
      queueItem.category_id != null ? (categoriesById.get(queueItem.category_id)?.name ?? null) : null,
    ...printerDenormalizedFields(
      queueItem.printer_id != null ? printersById.get(queueItem.printer_id) : null
    ),
    filaments: queueItem.filaments.map((filament) => ({
      ...filament,
      ...filamentDenormalizedFields(
        filament.filament_id != null ? filamentsById.get(filament.filament_id) : null
      ),
    })),
    extraItems: queueItem.extraItems.map((extraItem) => ({
      ...extraItem,
      ...extraItemDenormalizedFields(
        extraItem.extra_item_id != null ? extraItemsById.get(extraItem.extra_item_id) : null
      ),
    })),
  }));

  const filamentOptions = await getFilamentOptions();

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const queueByCreatedDesc = [...queueItemsRaw].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const lastQueueItem = queueByCreatedDesc.find((queueItem) => queueItem.printer_id != null);
  const lastQueueItemProfit = queueByCreatedDesc.find(
    (queueItem) => queueItem.profit_percent != null
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fila de Impressão</h1>
        <PrintQueueFormDialog
          categoryOptions={categoryOptions}
          filamentOptions={filamentOptions}
          printerOptions={printerOptions}
          extraItemOptions={extraItems}
          lastPrinterId={lastQueueItem?.printer_id}
          lastProfitPercent={lastQueueItemProfit?.profit_percent}
        />
      </div>

      {queueResult.total === 0 && !hasActiveFilters ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhum item na fila de impressão ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Suspense fallback={null}>
          <PrintQueuePageContent
            queueItems={queueItemsWithDetails}
            categoryOptions={categoryOptions}
            printerOptions={printerOptions}
            pagination={{
              page: queueResult.page,
              totalPages: queueResult.totalPages,
              total: queueResult.total,
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
