"use server";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { printerFormSchema, type PrinterFormInput } from "@/lib/schemas/printer";

function toRow(values: PrinterFormInput) {
  const parsed = printerFormSchema.parse(values);

  return {
    name: parsed.name,
    brand: parsed.brand ?? null,
    powerConsumptionW: parsed.powerConsumptionW ?? null,
    maintenanceCostPerHour: parsed.maintenanceCostPerHour ?? null,
    purchasePrice: parsed.purchasePrice ?? null,
    lifespanHours: parsed.lifespanHours ?? null,
    energyCostPerKwh: parsed.energyCostPerKwh ?? null,
  };
}

export async function createPrinterAction(values: PrinterFormInput) {
  const row = toRow(values);

  db.prepare(
    `INSERT INTO printers (name, brand, power_consumption_w, maintenance_cost_per_hour, purchase_price, lifespan_hours, energy_cost_per_kwh)
     VALUES (@name, @brand, @powerConsumptionW, @maintenanceCostPerHour, @purchasePrice, @lifespanHours, @energyCostPerKwh)`
  ).run(row);

  refresh();
}

export async function updatePrinterAction(id: number, values: PrinterFormInput) {
  const row = toRow(values);

  db.prepare(
    `UPDATE printers
     SET name = @name,
         brand = @brand,
         power_consumption_w = @powerConsumptionW,
         maintenance_cost_per_hour = @maintenanceCostPerHour,
         purchase_price = @purchasePrice,
         lifespan_hours = @lifespanHours,
         energy_cost_per_kwh = @energyCostPerKwh
     WHERE id = @id`
  ).run({ ...row, id });

  refresh();
}

export async function deletePrinterAction(id: number) {
  db.prepare("DELETE FROM printers WHERE id = ?").run(id);

  refresh();
}
