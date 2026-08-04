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
