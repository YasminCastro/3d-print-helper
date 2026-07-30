export function filamentPricePerKg(filament: {
  min_price_paid: number | null;
  max_price_paid: number | null;
}) {
  return filament.max_price_paid ?? filament.min_price_paid;
}

export function mostExpensivePricePerKgOfType(
  material: string | null,
  materialMaxPrices: Record<string, number>,
  fallbackPricePerKg: number | null
) {
  if (material && material in materialMaxPrices) {
    return materialMaxPrices[material];
  }
  return fallbackPricePerKg;
}

export function filamentCost(grams: number | null, pricePerKg: number | null) {
  if (grams == null || pricePerKg == null) return 0;
  return Math.round(((grams * pricePerKg) / 1000) * 100) / 100;
}

export function totalFilamentCost(
  filaments: { grams: number | null; pricePerKg: number | null }[]
) {
  return filaments.reduce(
    (sum, filament) => sum + filamentCost(filament.grams, filament.pricePerKg),
    0
  );
}

type PrinterTimeCostInput = {
  durationMinutes: number | null;
  powerConsumptionW: number | null;
  energyCostPerKwh: number | null;
  maintenanceCostPerHour: number | null;
};

function timeCost({
  durationMinutes,
  powerConsumptionW,
  energyCostPerKwh,
  maintenanceCostPerHour,
}: PrinterTimeCostInput) {
  const hoursTotal = (durationMinutes ?? 0) / 60;
  const energyCostPerHour = ((powerConsumptionW ?? 0) / 1000) * (energyCostPerKwh ?? 0);
  const costPerHour = energyCostPerHour + (maintenanceCostPerHour ?? 0);
  return costPerHour * hoursTotal;
}

export function printCost(
  input: PrinterTimeCostInput & {
    filamentCostTotal: number;
    extraMaterialsCost?: number;
  }
) {
  const rawCost = input.filamentCostTotal + timeCost(input) + (input.extraMaterialsCost ?? 0);
  return Math.round(rawCost * 100) / 100;
}

export function recalculatePrintCalculations(
  database: import("better-sqlite3").Database,
  printId: number
) {
  const print = database
    .prepare(
      `SELECT prints.duration_minutes, prints.profit_percent,
              printers.power_consumption_w AS printer_power_consumption_w,
              printers.energy_cost_per_kwh AS printer_energy_cost_per_kwh,
              printers.maintenance_cost_per_hour AS printer_maintenance_cost_per_hour
       FROM prints
       LEFT JOIN printers ON prints.printer_id = printers.id
       WHERE prints.id = ?`
    )
    .get(printId) as {
    duration_minutes: number | null;
    profit_percent: number | null;
    printer_power_consumption_w: number | null;
    printer_energy_cost_per_kwh: number | null;
    printer_maintenance_cost_per_hour: number | null;
  };

  const printFilaments = database
    .prepare(
      `SELECT print_filaments.grams,
              filaments.material AS filament_material,
              filaments.min_price_paid AS filament_min_price_paid,
              filaments.max_price_paid AS filament_max_price_paid
       FROM print_filaments
       LEFT JOIN filaments ON print_filaments.filament_id = filaments.id
       WHERE print_filaments.print_id = ?`
    )
    .all(printId) as {
    grams: number | null;
    filament_material: string | null;
    filament_min_price_paid: number | null;
    filament_max_price_paid: number | null;
  }[];

  const settings = database
    .prepare("SELECT default_profit_percent FROM app_settings WHERE id = 1")
    .get() as { default_profit_percent: number };

  const materialMaxPriceRows = database
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

  const filamentCostTotal = totalFilamentCost(
    printFilaments.map((filament) => ({
      grams: filament.grams,
      pricePerKg: filamentPricePerKg({
        min_price_paid: filament.filament_min_price_paid,
        max_price_paid: filament.filament_max_price_paid,
      }),
    }))
  );

  const worstCaseFilamentCostTotal = totalFilamentCost(
    printFilaments.map((filament) => {
      const ownPricePerKg = filamentPricePerKg({
        min_price_paid: filament.filament_min_price_paid,
        max_price_paid: filament.filament_max_price_paid,
      });
      return {
        grams: filament.grams,
        pricePerKg: mostExpensivePricePerKgOfType(
          filament.filament_material,
          materialMaxPrices,
          ownPricePerKg
        ),
      };
    })
  );

  const printerInput = {
    durationMinutes: print.duration_minutes,
    powerConsumptionW: print.printer_power_consumption_w,
    energyCostPerKwh: print.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: print.printer_maintenance_cost_per_hour,
  };
  const effectiveProfitPercent = print.profit_percent ?? settings.default_profit_percent;

  const printCostTotal = printCost({ ...printerInput, filamentCostTotal });
  const saleValueTotal = saleValue({
    ...printerInput,
    filamentCostTotal,
    profitPercent: effectiveProfitPercent,
  });
  const saleValueWorstCaseTotal = saleValue({
    ...printerInput,
    filamentCostTotal: worstCaseFilamentCostTotal,
    profitPercent: effectiveProfitPercent,
  });

  database
    .prepare(
      `UPDATE prints
       SET filament_cost = ?, print_cost = ?, sale_value = ?, sale_value_worst_case = ?
       WHERE id = ?`
    )
    .run(filamentCostTotal, printCostTotal, saleValueTotal, saleValueWorstCaseTotal, printId);
}

export function saleValue(
  input: PrinterTimeCostInput & {
    filamentCostTotal: number;
    profitPercent: number;
    extraMaterialsCost?: number;
  }
) {
  const baseWithProfit =
    (input.filamentCostTotal + timeCost(input)) * (1 + input.profitPercent / 100);
  const rawValue = baseWithProfit + (input.extraMaterialsCost ?? 0);
  return Math.round(rawValue * 100) / 100;
}
