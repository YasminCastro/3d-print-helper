import Link from "next/link";
import {
  AlertTriangle,
  BoxIcon,
  Gauge,
  LayoutDashboardIcon,
  Layers,
  NotebookTextIcon,
  XCircle,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { filamentTypeLabels } from "@/lib/filament-type-labels";
import { FilamentFormDialog } from "@/components/filament-form-dialog";
import { CalibrationFormDialog } from "@/components/calibration-form-dialog";
import { JournalFormDialog } from "@/components/journal-form-dialog";
import { PrintFormDialog } from "@/components/print-form-dialog";
import { PrintCard } from "@/components/print-card";
import { ShortcutTile } from "@/components/shortcut-tile";
import { getPrinters } from "@/lib/actions/printers";
import { printerDenormalizedFields } from "@/lib/printer-helpers";
import { getBrands } from "@/lib/actions/brands";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getExtraItems } from "@/lib/actions/extra-items";
import { extraItemDenormalizedFields } from "@/lib/extra-item-helpers";
import { getPrintCategories, getPrints } from "@/lib/actions/prints";
import { getCalibrations } from "@/lib/actions/calibrations";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import type { PrintWithDetails } from "@/lib/types/print";

const alertIcons: Record<
  "indisponivel" | "quase_acabando",
  typeof AlertTriangle
> = {
  indisponivel: XCircle,
  quase_acabando: AlertTriangle,
};

const alertBadgeClasses: Record<"indisponivel" | "quase_acabando", string> = {
  indisponivel:
    "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  quase_acabando:
    "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300",
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
  const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));
  const brandOptions = [...brands]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((brand) => ({ id: brand.id, name: brand.name }));

  const filamentOptions = await getFilamentOptions();

  const extraItems = await getExtraItems();
  const extraItemsById = new Map(extraItems.map((extraItem) => [extraItem.id, extraItem]));

  const [printCategoryOptions, printsResult] = await Promise.all([
    getPrintCategories(),
    getPrints({ limit: 20 }),
  ]);
  const printsRaw = printsResult.items;
  const categoriesById = new Map(printCategoryOptions.map((category) => [category.id, category]));

  const printerOptions = [...printers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((printer) => ({ id: printer.id, name: printer.name }));

  const calibrations = await getCalibrations();
  const lastCalibrationPrinterId = [...calibrations]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .find((calibration) => calibration.printer_id != null)?.printer_id;

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
      extraItems: print.extraItems.map((extraItem) => ({
        ...extraItem,
        ...extraItemDenormalizedFields(
          extraItem.extra_item_id != null ? extraItemsById.get(extraItem.extra_item_id) : null
        ),
      })),
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 ring-1 ring-foreground/10">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <LayoutDashboardIcon className="size-7" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Painel</h1>
          <p className="text-sm text-muted-foreground">Visão geral da sua produção 3D</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-2/15 text-chart-2">
            <ZapIcon className="size-3.5" />
          </span>
          Atalhos
        </div>
        <div className="flex flex-wrap gap-3">
          <FilamentFormDialog
            brandOptions={brandOptions}
            trigger={
              <ShortcutTile
                icon={Layers}
                label="Novo Filamento"
                description="Cadastrar filamento"
                color="chart-1"
              />
            }
          />
          <CalibrationFormDialog
            filamentOptions={filamentOptions}
            printerOptions={printerOptions}
            lastPrinterId={lastCalibrationPrinterId}
            trigger={
              <ShortcutTile
                icon={Gauge}
                label="Nova Calibração"
                description="Registrar calibração"
                color="chart-2"
              />
            }
          />
          <JournalFormDialog
            filamentOptions={filamentOptions}
            trigger={
              <ShortcutTile
                icon={NotebookTextIcon}
                label="Nova Entrada"
                description="Anotar no diário"
                color="chart-3"
              />
            }
          />
          <PrintFormDialog
            categoryOptions={printCategoryOptions}
            filamentOptions={filamentOptions}
            printerOptions={printerOptions}
            extraItemOptions={extraItems}
            lastPrinterId={lastPrint?.printer_id}
            lastProfitPercent={lastPrintProfit?.profit_percent}
            trigger={
              <ShortcutTile
                icon={BoxIcon}
                label="Nova Impressão"
                description="Registrar impressão"
                color="chart-4"
              />
            }
          />
        </div>
      </div>

      {recentPrintsWithDetails.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-1/15 text-chart-1">
              <BoxIcon className="size-3.5" />
            </span>
            Últimas impressões
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentPrintsWithDetails.map((print) => (
              <PrintCard key={print.id} print={print} />
            ))}
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="size-3.5" />
            </span>
            Alertas de filamento
          </div>
          <div className="flex flex-wrap gap-1.5">
            {alerts.map((filament) => {
              const availability = filament.availability as
                | "indisponivel"
                | "quase_acabando";
              const Icon = alertIcons[availability];
              const material = filament.material as (typeof filamentTypeOptions)[number] | null;
              const brandName =
                filament.brand_id != null ? (brandsById.get(filament.brand_id) ?? null) : null;

              return (
                <Badge
                  key={filament.id}
                  variant="outline"
                  className={`cursor-pointer transition hover:opacity-80 ${alertBadgeClasses[availability]}`}
                  render={<Link href={`/filaments/${filament.id}`} />}
                >
                  <Icon className="size-3" />
                  <span className="font-medium">{filament.name}</span>
                  {material && (
                    <span className="opacity-70">
                      · {filamentTypeLabels[material] ?? material}
                    </span>
                  )}
                  {brandName && <span className="opacity-70">· {brandName}</span>}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
