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
  printId: number,
  printer?: {
    powerConsumptionW: number | null;
    energyCostPerKwh: number | null;
    maintenanceCostPerHour: number | null;
  } | null,
  filamentPricing?: {
    filamentsById: Map<
      number,
      { material: string | null; min_price_paid: number | null; max_price_paid: number | null }
    >;
    materialMaxPrices: Record<string, number>;
  } | null
) {
  const print = database
    .prepare(`SELECT duration_minutes, profit_percent FROM prints WHERE id = ?`)
    .get(printId) as {
    duration_minutes: number | null;
    profit_percent: number | null;
  };

  const printFilaments = database
    .prepare(`SELECT grams, filament_id FROM print_filaments WHERE print_id = ?`)
    .all(printId) as { grams: number | null; filament_id: number | null }[];

  const settings = database
    .prepare("SELECT default_profit_percent FROM app_settings WHERE id = 1")
    .get() as { default_profit_percent: number };

  const filamentsById = filamentPricing?.filamentsById ?? new Map();
  const materialMaxPrices = filamentPricing?.materialMaxPrices ?? {};

  const filamentCostTotal = totalFilamentCost(
    printFilaments.map((filament) => {
      const details = filament.filament_id != null ? filamentsById.get(filament.filament_id) : undefined;
      return {
        grams: filament.grams,
        pricePerKg: filamentPricePerKg({
          min_price_paid: details?.min_price_paid ?? null,
          max_price_paid: details?.max_price_paid ?? null,
        }),
      };
    })
  );

  const worstCaseFilamentCostTotal = totalFilamentCost(
    printFilaments.map((filament) => {
      const details = filament.filament_id != null ? filamentsById.get(filament.filament_id) : undefined;
      const ownPricePerKg = filamentPricePerKg({
        min_price_paid: details?.min_price_paid ?? null,
        max_price_paid: details?.max_price_paid ?? null,
      });
      return {
        grams: filament.grams,
        pricePerKg: mostExpensivePricePerKgOfType(
          details?.material ?? null,
          materialMaxPrices,
          ownPricePerKg
        ),
      };
    })
  );

  const printerInput = {
    durationMinutes: print.duration_minutes,
    powerConsumptionW: printer?.powerConsumptionW ?? null,
    energyCostPerKwh: printer?.energyCostPerKwh ?? null,
    maintenanceCostPerHour: printer?.maintenanceCostPerHour ?? null,
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
