"use server";

import { refresh } from "next/cache";

import { backendFetch } from "@/lib/backend-fetch";
import { NEW_CATEGORY_VALUE } from "@/lib/schemas/print";
import type { PrintCategory, PrintWithFilaments } from "@/lib/types/print";

type ApiPrintFilament = {
  filamentId: number | null;
  grams: number | null;
};

type ApiPrintExtraItem = {
  extraItemId: number | null;
  quantity: number | null;
};

type ApiPrint = {
  id: number;
  name: string;
  photoFilename: string | null;
  photoMimeType: string | null;
  printDate: string | null;
  durationMinutes: number | null;
  status: string | null;
  result: string | null;
  categoryId: number | null;
  printerId: number | null;
  printLink: string | null;
  notes: string | null;
  profitPercent: number | null;
  filamentCost: number | null;
  printCost: number | null;
  saleValue: number | null;
  saleValueWorstCase: number | null;
  saleValueActual: number | null;
  createdAt: string;
  filaments: ApiPrintFilament[];
  extraItems: ApiPrintExtraItem[];
};

type ApiPrintCategory = {
  id: number;
  name: string;
  createdAt: string;
};

function toDomainCategory(api: ApiPrintCategory): PrintCategory {
  return { id: api.id, name: api.name, created_at: api.createdAt };
}

function toDomain(api: ApiPrint): PrintWithFilaments {
  return {
    id: api.id,
    name: api.name,
    photo_filename: api.photoFilename,
    photo_mime_type: api.photoMimeType,
    print_date: api.printDate,
    duration_minutes: api.durationMinutes,
    status: api.status,
    result: api.result,
    category_id: api.categoryId,
    printer_id: api.printerId,
    print_link: api.printLink,
    notes: api.notes,
    profit_percent: api.profitPercent,
    filament_cost: api.filamentCost,
    print_cost: api.printCost,
    sale_value: api.saleValue,
    sale_value_worst_case: api.saleValueWorstCase,
    sale_value_actual: api.saleValueActual,
    created_at: api.createdAt,
    filaments: api.filaments.map((filament, index) => ({
      filament_id: filament.filamentId,
      grams: filament.grams,
      position: index,
    })),
    extraItems: api.extraItems.map((extraItem, index) => ({
      extra_item_id: extraItem.extraItemId,
      quantity: extraItem.quantity,
      position: index,
    })),
  };
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

async function resolveCategoryId(categoryId: string | null, newCategoryName: string | null) {
  if (categoryId === NEW_CATEGORY_VALUE) {
    const name = (newCategoryName ?? "").trim();
    if (!name) return null;

    const response = await backendFetch("/print-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Não foi possível criar a categoria");
    }

    const body = await response.json();
    return (body.data as ApiPrintCategory).id;
  }

  if (categoryId) return Number(categoryId);

  return null;
}

function parseFilaments(formData: FormData) {
  const raw = String(formData.get("filaments") ?? "[]");

  let parsed: { filamentId?: string; grams?: number }[] = [];
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }

  return parsed
    .map((entry) => ({
      filamentId: entry.filamentId ? Number(entry.filamentId) : null,
      grams: parseNumber(entry.grams),
    }))
    .filter((entry) => entry.filamentId !== null || entry.grams !== null);
}

function parseExtraItems(formData: FormData) {
  const raw = String(formData.get("extraItems") ?? "[]");

  let parsed: { extraItemId?: string; quantity?: number }[] = [];
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }

  return parsed
    .map((entry) => ({
      extraItemId: entry.extraItemId ? Number(entry.extraItemId) : null,
      quantity: parseNumber(entry.quantity),
    }))
    .filter((entry) => entry.extraItemId !== null || entry.quantity !== null);
}

async function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const printDate = String(formData.get("printDate") ?? "").trim() || null;
  const durationHours = parseNumber(formData.get("durationHours"));
  const durationMinutes = parseNumber(formData.get("durationMinutes"));
  const status = String(formData.get("status") ?? "").trim() || null;
  const result = String(formData.get("result") ?? "").trim() || null;
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim() || null;
  const newCategoryName = String(formData.get("newCategoryName") ?? "").trim() || null;
  const printerIdRaw = String(formData.get("printerId") ?? "").trim() || null;
  const printLink = String(formData.get("printLink") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const profitPercent = parseNumber(formData.get("profitPercent"));
  const saleValueActual = parseNumber(formData.get("saleValueActual"));

  const durationTotalMinutes =
    durationHours === null && durationMinutes === null
      ? null
      : (durationHours ?? 0) * 60 + (durationMinutes ?? 0);

  const categoryId = await resolveCategoryId(categoryIdRaw, newCategoryName);
  const printerId = printerIdRaw ? Number(printerIdRaw) : null;
  const filaments = parseFilaments(formData);
  const extraItems = parseExtraItems(formData);

  return {
    name,
    printDate,
    durationTotalMinutes,
    status,
    result,
    categoryId,
    printerId,
    printLink,
    notes,
    profitPercent,
    saleValueActual,
    filaments,
    extraItems,
  };
}

function toPayload(fields: Awaited<ReturnType<typeof parseFields>>) {
  return {
    name: fields.name,
    printDate: fields.printDate,
    durationMinutes: fields.durationTotalMinutes,
    status: fields.status,
    result: fields.result,
    categoryId: fields.categoryId,
    printerId: fields.printerId,
    printLink: fields.printLink,
    notes: fields.notes,
    profitPercent: fields.profitPercent,
    saleValueActual: fields.saleValueActual,
    filaments: fields.filaments.map((filament) => ({
      filamentId: filament.filamentId,
      grams: filament.grams,
    })),
    extraItems: fields.extraItems.map((extraItem) => ({
      extraItemId: extraItem.extraItemId,
      quantity: extraItem.quantity,
    })),
  };
}

async function uploadPhoto(printId: number, file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await backendFetch(`/prints/${printId}/photo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      data: buffer.toString("base64"),
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível enviar a foto");
  }
}

export async function getPrints(): Promise<PrintWithFilaments[]> {
  const response = await backendFetch("/prints", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar as impressões");
  }
  const body = await response.json();
  return (body.data as ApiPrint[]).map(toDomain);
}

export async function getPrint(id: number): Promise<PrintWithFilaments | null> {
  const response = await backendFetch(`/prints/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar a impressão");
  }
  const body = await response.json();
  return toDomain(body.data);
}

export async function getPrintCategories(): Promise<PrintCategory[]> {
  const response = await backendFetch("/print-categories", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar as categorias");
  }
  const body = await response.json();
  return (body.data as ApiPrintCategory[]).map(toDomainCategory);
}

export async function createPrintAction(formData: FormData) {
  const fields = await parseFields(formData);
  const photo = formData.get("photo");

  const response = await backendFetch("/prints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(fields)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a impressão");
  }

  const body = await response.json();
  const created = body.data as ApiPrint;

  if (photo instanceof File && photo.size > 0) {
    await uploadPhoto(created.id, photo);
  }

  refresh();
}

export async function updatePrintAction(id: number, formData: FormData) {
  const fields = await parseFields(formData);
  const photo = formData.get("photo");

  const response = await backendFetch(`/prints/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(fields)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a impressão");
  }

  if (photo instanceof File && photo.size > 0) {
    await uploadPhoto(id, photo);
  }

  refresh();
}

export async function deletePrintAction(id: number) {
  const response = await backendFetch(`/prints/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a impressão");
  }

  refresh();
}
