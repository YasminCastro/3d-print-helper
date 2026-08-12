"use server";

import { refresh } from "next/cache";

import { backendErrorMessage, backendFetch } from "@/lib/backend-fetch";
import { extraItemFormSchema, type ExtraItemFormInput } from "@/lib/schemas/extra-item";
import type { ExtraItem } from "@/lib/types/extra-item";

type ApiExtraItem = {
  id: number;
  name: string;
  cost: number;
  createdAt: string;
};

function toDomain(api: ApiExtraItem): ExtraItem {
  return {
    id: api.id,
    name: api.name,
    cost: api.cost,
    createdAt: api.createdAt,
  };
}

function toPayload(values: ExtraItemFormInput) {
  const parsed = extraItemFormSchema.parse(values);

  return {
    name: parsed.name,
    cost: parsed.cost ?? 0,
  };
}

export async function getExtraItems(): Promise<ExtraItem[]> {
  const response = await backendFetch("/extra-items", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar os itens extras");
  }
  const body = await response.json();
  return (body.data as ApiExtraItem[]).map(toDomain);
}

export async function getExtraItem(id: number): Promise<ExtraItem | null> {
  const response = await backendFetch(`/extra-items/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar o item extra");
  }
  const body = await response.json();
  return toDomain(body.data);
}

export async function createExtraItemAction(values: ExtraItemFormInput) {
  const response = await backendFetch("/extra-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error(await backendErrorMessage(response, "Não foi possível criar o item extra"));
  }

  refresh();
}

export async function updateExtraItemAction(id: number, values: ExtraItemFormInput) {
  const response = await backendFetch(`/extra-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error(
      await backendErrorMessage(response, "Não foi possível atualizar o item extra"),
    );
  }

  refresh();
}

export async function deleteExtraItemAction(id: number) {
  const response = await backendFetch(`/extra-items/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir o item extra");
  }

  refresh();
}
