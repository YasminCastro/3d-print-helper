"use server";

import { refresh } from "next/cache";

import { backendUrl } from "@/lib/backend-url";
import { printerFormSchema, type PrinterFormInput } from "@/lib/schemas/printer";
import type { Printer } from "@/lib/types/printer";

function toPayload(values: PrinterFormInput) {
  const parsed = printerFormSchema.parse(values);

  return {
    name: parsed.name,
    brand: parsed.brand || null,
    powerConsumptionW: parsed.powerConsumptionW ?? null,
    maintenanceCostPerHour: parsed.maintenanceCostPerHour ?? null,
    purchasePrice: parsed.purchasePrice ?? null,
    lifespanHours: parsed.lifespanHours ?? null,
    energyCostPerKwh: parsed.energyCostPerKwh ?? null,
  };
}

export async function getPrinters(): Promise<Printer[]> {
  const response = await fetch(backendUrl("/printers"), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar as impressoras");
  }
  const body = await response.json();
  return body.data;
}

export async function getPrinter(id: number): Promise<Printer | null> {
  const response = await fetch(backendUrl(`/printers/${id}`), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar a impressora");
  }
  const body = await response.json();
  return body.data;
}

export async function createPrinterAction(values: PrinterFormInput) {
  const response = await fetch(backendUrl("/printers"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a impressora");
  }

  refresh();
}

export async function updatePrinterAction(id: number, values: PrinterFormInput) {
  const response = await fetch(backendUrl(`/printers/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a impressora");
  }

  refresh();
}

export async function deletePrinterAction(id: number) {
  const response = await fetch(backendUrl(`/printers/${id}`), { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a impressora");
  }

  refresh();
}
