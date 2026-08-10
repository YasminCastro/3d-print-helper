"use server";

import { refresh } from "next/cache";

import { backendFetch } from "@/lib/backend-fetch";
import { printCategoryFormSchema, type PrintCategoryFormInput } from "@/lib/schemas/print-category";
import type { PrintCategory } from "@/lib/types/print-category";

type ApiPrintCategory = {
  id: number;
  name: string;
  color: string | null;
  createdAt: string;
};

function toDomain(api: ApiPrintCategory): PrintCategory {
  return {
    id: api.id,
    name: api.name,
    color: api.color,
    createdAt: api.createdAt,
  };
}

function toPayload(values: PrintCategoryFormInput) {
  const parsed = printCategoryFormSchema.parse(values);

  return {
    name: parsed.name,
    color: parsed.color || null,
  };
}

export async function getPrintCategories(): Promise<PrintCategory[]> {
  const response = await backendFetch("/print-categories", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar as categorias");
  }
  const body = await response.json();
  return (body.data as ApiPrintCategory[]).map(toDomain);
}

export async function createPrintCategoryAction(values: PrintCategoryFormInput) {
  const response = await backendFetch("/print-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a categoria");
  }

  refresh();
}

export async function updatePrintCategoryAction(id: number, values: PrintCategoryFormInput) {
  const response = await backendFetch(`/print-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a categoria");
  }

  refresh();
}

export async function deletePrintCategoryAction(id: number) {
  const response = await backendFetch(`/print-categories/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a categoria");
  }

  refresh();
}
