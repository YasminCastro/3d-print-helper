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
import type { Filament, FilamentOption } from "@/lib/types/filament";
import type {
  PrintCategory,
  PrintFilamentWithDetails,
  PrintWithCategory,
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

export default function Home() {
  const alerts = db
    .prepare(
      `SELECT * FROM filaments
       WHERE availability IN ('indisponivel', 'quase_acabando')
       ORDER BY availability ASC, name ASC`,
    )
    .all() as Filament[];

  const brandOptions = db
    .prepare("SELECT id, name FROM filament_brands ORDER BY name ASC")
    .all() as { id: number; name: string }[];

  const filamentOptions = db
    .prepare(
      `SELECT filaments.id, filaments.name, filaments.color, filaments.material,
              filament_brands.name AS brand_name
       FROM filaments
       LEFT JOIN filament_brands ON filaments.brand_id = filament_brands.id
       ORDER BY filaments.name ASC`
    )
    .all() as FilamentOption[];

  const printCategoryOptions = db
    .prepare("SELECT * FROM print_categories ORDER BY name ASC")
    .all() as PrintCategory[];

  const printerOptions = db
    .prepare("SELECT id, name FROM printers ORDER BY name ASC")
    .all() as { id: number; name: string }[];

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

  const recentPrints = db
    .prepare(
      `SELECT prints.*, print_categories.name AS category_name,
              printers.name AS printer_name,
              printers.power_consumption_w AS printer_power_consumption_w,
              printers.energy_cost_per_kwh AS printer_energy_cost_per_kwh,
              printers.maintenance_cost_per_hour AS printer_maintenance_cost_per_hour
       FROM prints
       LEFT JOIN print_categories ON prints.category_id = print_categories.id
       LEFT JOIN printers ON prints.printer_id = printers.id
       ORDER BY prints.created_at DESC
       LIMIT 5`
    )
    .all() as PrintWithCategory[];

  const recentPrintIds = recentPrints.map((print) => print.id);
  const recentPrintFilaments = recentPrintIds.length
    ? (db
        .prepare(
          `SELECT print_filaments.*, filaments.name AS filament_name, filaments.color AS filament_color,
                  filaments.material AS filament_material,
                  filaments.min_price_paid AS filament_min_price_paid,
                  filaments.max_price_paid AS filament_max_price_paid
           FROM print_filaments
           LEFT JOIN filaments ON print_filaments.filament_id = filaments.id
           WHERE print_filaments.print_id IN (${recentPrintIds.map(() => "?").join(",")})
           ORDER BY print_filaments.print_id ASC, print_filaments.position ASC`
        )
        .all(...recentPrintIds) as PrintFilamentWithDetails[])
    : [];

  const recentFilamentsByPrint = new Map<number, PrintFilamentWithDetails[]>();
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
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
