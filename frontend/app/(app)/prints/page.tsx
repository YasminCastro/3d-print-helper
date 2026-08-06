import { Suspense } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintFormDialog } from "@/components/print-form-dialog";
import { PrintsPageContent } from "@/components/prints-page-content";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getExtraItems } from "@/lib/actions/extra-items";
import { extraItemDenormalizedFields } from "@/lib/extra-item-helpers";
import { getPrintCategories, getPrints } from "@/lib/actions/prints";
import {
  printDurationRangeOptions,
  printResultOptions,
  printSortOptions,
  printStatusOptions,
  type PrintDurationRange,
  type PrintSortOption,
} from "@/lib/schemas/print";
import type { PrintWithDetails } from "@/lib/types/print";

const DEFAULT_SORT: PrintSortOption = "newest";

function parseSort(raw: string | undefined): PrintSortOption {
  return (printSortOptions as readonly string[]).includes(raw ?? "")
    ? (raw as PrintSortOption)
    : DEFAULT_SORT;
}

function toArray(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function parseEnumArray<T extends string>(
  raw: string | string[] | undefined,
  allowed: readonly T[]
): T[] {
  return toArray(raw).filter((value): value is T => (allowed as readonly string[]).includes(value));
}

export default async function PrintsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
    categoryId?: string | string[];
    duration?: string | string[];
    status?: string | string[];
    result?: string | string[];
  }>;
}) {
  const {
    page: pageParam,
    sort: sortParam,
    search: searchParam,
    categoryId: categoryIdParam,
    duration: durationParam,
    status: statusParam,
    result: resultParam,
  } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const sort = parseSort(sortParam);
  const search = searchParam?.trim() || undefined;
  const categoryIds = toArray(categoryIdParam)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  const durationRanges = parseEnumArray<PrintDurationRange>(
    durationParam,
    printDurationRangeOptions.map((option) => option.value)
  );
  const statuses = parseEnumArray(statusParam, printStatusOptions);
  const results = parseEnumArray(resultParam, printResultOptions);

  const hasActiveFilters =
    Boolean(search) ||
    categoryIds.length > 0 ||
    durationRanges.length > 0 ||
    statuses.length > 0 ||
    results.length > 0;

  const [printers, filaments, extraItems, printsResult, categoryOptions] = await Promise.all([
    getPrinters(),
    getFilaments(),
    getExtraItems(),
    getPrints({ page, sort, search, categoryIds, durationRanges, statuses, results }),
    getPrintCategories(),
  ]);

  const printsRaw = printsResult.items;

  const printersById = new Map(printers.map((printer) => [printer.id, printer]));
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));
  const extraItemsById = new Map(extraItems.map((extraItem) => [extraItem.id, extraItem]));
  const categoriesById = new Map(categoryOptions.map((category) => [category.id, category]));

  const printsWithDetails: PrintWithDetails[] = printsRaw.map((print) => ({
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
    extraItems: print.extraItems.map((extraItem) => ({
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
          extraItemOptions={extraItems}
          lastPrinterId={lastPrint?.printer_id}
          lastProfitPercent={lastPrintProfit?.profit_percent}
        />
      </div>

      {printsResult.total === 0 && !hasActiveFilters ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma impressão cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Suspense fallback={null}>
          <PrintsPageContent
            prints={printsWithDetails}
            categoryOptions={categoryOptions}
            pagination={{
              page: printsResult.page,
              totalPages: printsResult.totalPages,
              total: printsResult.total,
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
