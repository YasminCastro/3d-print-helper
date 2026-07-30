import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintFormDialog } from "@/components/print-form-dialog";
import { PrintsPageContent } from "@/components/prints-page-content";
import type {
  PrintCategory,
  PrintFilamentWithDetails,
  PrintWithCategory,
  PrintWithDetails,
} from "@/lib/types/print";
import type { FilamentOption } from "@/lib/types/filament";
import type { AppSettings } from "@/lib/types/settings";

export default function PrintsPage() {
  const prints = db
    .prepare(
      `SELECT prints.*, print_categories.name AS category_name,
              printers.name AS printer_name,
              printers.power_consumption_w AS printer_power_consumption_w,
              printers.energy_cost_per_kwh AS printer_energy_cost_per_kwh,
              printers.maintenance_cost_per_hour AS printer_maintenance_cost_per_hour
       FROM prints
       LEFT JOIN print_categories ON prints.category_id = print_categories.id
       LEFT JOIN printers ON prints.printer_id = printers.id
       ORDER BY COALESCE(prints.print_date, prints.created_at) DESC`
    )
    .all() as PrintWithCategory[];

  const printFilaments = db
    .prepare(
      `SELECT print_filaments.*, filaments.name AS filament_name, filaments.color AS filament_color,
              filaments.material AS filament_material,
              filaments.min_price_paid AS filament_min_price_paid,
              filaments.max_price_paid AS filament_max_price_paid
       FROM print_filaments
       LEFT JOIN filaments ON print_filaments.filament_id = filaments.id
       ORDER BY print_filaments.print_id ASC, print_filaments.position ASC`
    )
    .all() as PrintFilamentWithDetails[];

  const filamentsByPrint = new Map<number, PrintFilamentWithDetails[]>();
  for (const filament of printFilaments) {
    const list = filamentsByPrint.get(filament.print_id) ?? [];
    list.push(filament);
    filamentsByPrint.set(filament.print_id, list);
  }

  const printsWithDetails: PrintWithDetails[] = prints.map((print) => ({
    ...print,
    filaments: filamentsByPrint.get(print.id) ?? [],
  }));

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Impressões</h1>
        <PrintFormDialog
          categoryOptions={categoryOptions}
          filamentOptions={filamentOptions}
          printerOptions={printerOptions}
          defaultProfitPercent={settings.default_profit_percent}
          lastPrinterId={lastPrint?.printer_id}
          lastProfitPercent={lastPrintProfit?.profit_percent}
        />
      </div>

      {printsWithDetails.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma impressão cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <PrintsPageContent prints={printsWithDetails} categoryOptions={categoryOptions} />
      )}
    </div>
  );
}
