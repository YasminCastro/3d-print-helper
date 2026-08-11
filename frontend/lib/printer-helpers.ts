import type { Printer } from "@/lib/types/printer";

export function printerDenormalizedFields(printer: Printer | null | undefined) {
  return {
    printer_name: printer?.name ?? null,
    printer_power_consumption_w: printer?.powerConsumptionW ?? null,
    printer_energy_cost_per_kwh: printer?.energyCostPerKwh ?? null,
    printer_maintenance_cost_per_hour: printer?.maintenanceCostPerHour ?? null,
  };
}

export function printerNameDenormalizedField(printer: Printer | null | undefined) {
  return {
    printer_name: printer?.name ?? null,
  };
}
