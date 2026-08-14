"use server";

import { refresh } from "next/cache";

import { backendErrorMessage, backendFetch } from "@/lib/backend-fetch";
import { NEW_CATEGORY_VALUE } from "@/lib/schemas/print";
import type { PrintQueueSortOption } from "@/lib/schemas/print-queue";
import type { PrintQueueItemWithFilaments } from "@/lib/types/print-queue";

type ApiPrintQueueFilament = {
  filamentId: number | null;
  grams: number | null;
};

type ApiPrintQueueExtraItem = {
  extraItemId: number | null;
  quantity: number | null;
};

type ApiPrintQueueItem = {
  id: number;
  name: string;
  durationMinutes: number | null;
  categoryId: number | null;
  printerId: number | null;
  printLink: string | null;
  notes: string | null;
  profitPercent: number | null;
  filamentCost: number | null;
  printCost: number | null;
  saleValue: number | null;
  saleValueWorstCase: number | null;
  createdAt: string;
  filaments: ApiPrintQueueFilament[];
  extraItems: ApiPrintQueueExtraItem[];
};

type ApiPrintCategory = {
  id: number;
  name: string;
  createdAt: string;
};

function toDomain(api: ApiPrintQueueItem): PrintQueueItemWithFilaments {
  return {
    id: api.id,
    name: api.name,
    duration_minutes: api.durationMinutes,
    category_id: api.categoryId,
    printer_id: api.printerId,
    print_link: api.printLink,
    notes: api.notes,
    profit_percent: api.profitPercent,
    filament_cost: api.filamentCost,
    print_cost: api.printCost,
    sale_value: api.saleValue,
    sale_value_worst_case: api.saleValueWorstCase,
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
      throw new Error(await backendErrorMessage(response, "Não foi possível criar a categoria"));
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
  const durationHours = parseNumber(formData.get("durationHours"));
  const durationMinutes = parseNumber(formData.get("durationMinutes"));
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim() || null;
  const newCategoryName = String(formData.get("newCategoryName") ?? "").trim() || null;
  const printerIdRaw = String(formData.get("printerId") ?? "").trim() || null;
  const printLink = String(formData.get("printLink") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const profitPercent = parseNumber(formData.get("profitPercent"));

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
    durationTotalMinutes,
    categoryId,
    printerId,
    printLink,
    notes,
    profitPercent,
    filaments,
    extraItems,
  };
}

function toPayload(fields: Awaited<ReturnType<typeof parseFields>>) {
  return {
    name: fields.name,
    durationMinutes: fields.durationTotalMinutes,
    categoryId: fields.categoryId,
    printerId: fields.printerId,
    printLink: fields.printLink,
    notes: fields.notes,
    profitPercent: fields.profitPercent,
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

export type PrintQueuePageResult = {
  items: PrintQueueItemWithFilaments[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getPrintQueueItems(params?: {
  page?: number;
  limit?: number;
  sort?: PrintQueueSortOption;
  search?: string;
  categoryIds?: number[];
  printerIds?: number[];
}): Promise<PrintQueuePageResult> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sort) query.set("sort", params.sort);
  if (params?.search) query.set("search", params.search);
  params?.categoryIds?.forEach((id) => query.append("categoryId", String(id)));
  params?.printerIds?.forEach((id) => query.append("printerId", String(id)));
  const queryString = query.toString();

  const response = await backendFetch(`/print-queue${queryString ? `?${queryString}` : ""}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Não foi possível carregar a fila de impressão");
  }
  const body = await response.json();
  return {
    items: (body.data as ApiPrintQueueItem[]).map(toDomain),
    page: body.meta.page,
    limit: body.meta.limit,
    total: body.meta.total,
    totalPages: body.meta.totalPages,
  };
}

export async function getPrintQueueItem(id: number): Promise<PrintQueueItemWithFilaments | null> {
  const response = await backendFetch(`/print-queue/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar o item da fila");
  }
  const body = await response.json();
  return toDomain(body.data);
}

export async function createPrintQueueItemAction(formData: FormData) {
  const fields = await parseFields(formData);

  const response = await backendFetch("/print-queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(fields)),
  });

  if (!response.ok) {
    throw new Error(await backendErrorMessage(response, "Não foi possível criar o item da fila"));
  }

  refresh();
}

export async function updatePrintQueueItemAction(id: number, formData: FormData) {
  const fields = await parseFields(formData);

  const response = await backendFetch(`/print-queue/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(fields)),
  });

  if (!response.ok) {
    throw new Error(
      await backendErrorMessage(response, "Não foi possível atualizar o item da fila"),
    );
  }

  refresh();
}

export async function deletePrintQueueItemAction(id: number) {
  const response = await backendFetch(`/print-queue/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir o item da fila");
  }

  refresh();
}

export async function markPrintQueueItemAsPrintedAction(
  id: number,
  formData: FormData,
): Promise<{ printId: number }> {
  const printDate = String(formData.get("printDate") ?? "").trim() || null;
  const result = String(formData.get("result") ?? "").trim() || null;
  const saleValueActual = parseNumber(formData.get("saleValueActual"));
  const photo = formData.get("photo");

  let photoPayload: { filename: string; mimeType: string; data: string } | null = null;
  if (photo instanceof File && photo.size > 0) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    photoPayload = {
      filename: photo.name,
      mimeType: photo.type || "application/octet-stream",
      data: buffer.toString("base64"),
    };
  }

  const response = await backendFetch(`/print-queue/${id}/mark-printed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ printDate, result, saleValueActual, photo: photoPayload }),
  });

  if (!response.ok) {
    throw new Error(
      await backendErrorMessage(response, "Não foi possível marcar o item como impresso"),
    );
  }

  const body = await response.json();
  refresh();
  return { printId: (body.data as { id: number }).id };
}
