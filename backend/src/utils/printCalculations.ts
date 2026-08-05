const DEFAULT_PROFIT_PERCENT = 50;

export type PrinterTimeCostInput = {
  durationMinutes: number | null;
  powerConsumptionW: number | null;
  energyCostPerKwh: number | null;
  maintenanceCostPerHour: number | null;
};

export function filamentPricePerKg(filament: {
  minPricePaid: number | null;
  maxPricePaid: number | null;
}): number | null {
  return filament.maxPricePaid ?? filament.minPricePaid;
}

export function mostExpensivePricePerKgOfType(
  material: string | null,
  materialMaxPrices: Record<string, number>,
  fallbackPricePerKg: number | null,
): number | null {
  if (material && material in materialMaxPrices) {
    return materialMaxPrices[material];
  }
  return fallbackPricePerKg;
}

export function filamentCost(grams: number | null, pricePerKg: number | null): number {
  if (grams == null || pricePerKg == null) return 0;
  return Math.round(((grams * pricePerKg) / 1000) * 100) / 100;
}

export function totalFilamentCost(
  filaments: { grams: number | null; pricePerKg: number | null }[],
): number {
  return filaments.reduce((sum, filament) => sum + filamentCost(filament.grams, filament.pricePerKg), 0);
}

function timeCost({
  durationMinutes,
  powerConsumptionW,
  energyCostPerKwh,
  maintenanceCostPerHour,
}: PrinterTimeCostInput): number {
  const hoursTotal = (durationMinutes ?? 0) / 60;
  const energyCostPerHour = ((powerConsumptionW ?? 0) / 1000) * (energyCostPerKwh ?? 0);
  const costPerHour = energyCostPerHour + (maintenanceCostPerHour ?? 0);
  return costPerHour * hoursTotal;
}

export function printCost(
  input: PrinterTimeCostInput & { filamentCostTotal: number; extraMaterialsCost?: number },
): number {
  const rawCost = input.filamentCostTotal + timeCost(input) + (input.extraMaterialsCost ?? 0);
  return Math.round(rawCost * 100) / 100;
}

export function saleValue(
  input: PrinterTimeCostInput & {
    filamentCostTotal: number;
    profitPercent: number;
    extraMaterialsCost?: number;
  },
): number {
  const baseWithProfit = (input.filamentCostTotal + timeCost(input)) * (1 + input.profitPercent / 100);
  const rawValue = baseWithProfit + (input.extraMaterialsCost ?? 0);
  return Math.round(rawValue * 100) / 100;
}

export function totalExtraItemsCost(
  extraItems: { quantity: number | null; cost: number | null }[],
): number {
  const raw = extraItems.reduce(
    (sum, extraItem) => sum + (extraItem.quantity ?? 0) * (extraItem.cost ?? 0),
    0,
  );
  return Math.round(raw * 100) / 100;
}

export function computeMaterialMaxPrices(
  filaments: { material: string | null; pricePerKg: number | null }[],
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const filament of filaments) {
    if (!filament.material || filament.pricePerKg == null) continue;
    if (!(filament.material in result) || filament.pricePerKg > result[filament.material]) {
      result[filament.material] = filament.pricePerKg;
    }
  }

  return result;
}

export type PrintCalculationsInput = {
  durationMinutes: number | null;
  profitPercent: number | null;
  printFilaments: { grams: number | null; filamentId: number | null }[];
  printExtraItems: { quantity: number | null; extraItemId: number | null }[];
  printer: {
    powerConsumptionW: number | null;
    energyCostPerKwh: number | null;
    maintenanceCostPerHour: number | null;
  } | null;
  filamentsById: Map<number, { material: string | null; minPricePaid: number | null; maxPricePaid: number | null }>;
  extraItemsById: Map<number, { cost: number | null }>;
  materialMaxPrices: Record<string, number>;
};

export function calculatePrintCosts(input: PrintCalculationsInput): {
  filamentCost: number;
  printCost: number;
  saleValue: number;
  saleValueWorstCase: number;
} {
  const filamentCostTotal = totalFilamentCost(
    input.printFilaments.map((filament) => {
      const details = filament.filamentId != null ? input.filamentsById.get(filament.filamentId) : undefined;
      return {
        grams: filament.grams,
        pricePerKg: filamentPricePerKg({
          minPricePaid: details?.minPricePaid ?? null,
          maxPricePaid: details?.maxPricePaid ?? null,
        }),
      };
    }),
  );

  const worstCaseFilamentCostTotal = totalFilamentCost(
    input.printFilaments.map((filament) => {
      const details = filament.filamentId != null ? input.filamentsById.get(filament.filamentId) : undefined;
      const ownPricePerKg = filamentPricePerKg({
        minPricePaid: details?.minPricePaid ?? null,
        maxPricePaid: details?.maxPricePaid ?? null,
      });
      return {
        grams: filament.grams,
        pricePerKg: mostExpensivePricePerKgOfType(details?.material ?? null, input.materialMaxPrices, ownPricePerKg),
      };
    }),
  );

  const printerInput: PrinterTimeCostInput = {
    durationMinutes: input.durationMinutes,
    powerConsumptionW: input.printer?.powerConsumptionW ?? null,
    energyCostPerKwh: input.printer?.energyCostPerKwh ?? null,
    maintenanceCostPerHour: input.printer?.maintenanceCostPerHour ?? null,
  };
  const effectiveProfitPercent = input.profitPercent ?? DEFAULT_PROFIT_PERCENT;

  const extraItemsCost = totalExtraItemsCost(
    input.printExtraItems.map((extraItem) => ({
      quantity: extraItem.quantity,
      cost: extraItem.extraItemId != null ? (input.extraItemsById.get(extraItem.extraItemId)?.cost ?? null) : null,
    })),
  );

  return {
    filamentCost: filamentCostTotal,
    printCost: printCost({ ...printerInput, filamentCostTotal, extraMaterialsCost: extraItemsCost }),
    saleValue: saleValue({
      ...printerInput,
      filamentCostTotal,
      profitPercent: effectiveProfitPercent,
      extraMaterialsCost: extraItemsCost,
    }),
    saleValueWorstCase: saleValue({
      ...printerInput,
      filamentCostTotal: worstCaseFilamentCostTotal,
      profitPercent: effectiveProfitPercent,
      extraMaterialsCost: extraItemsCost,
    }),
  };
}
