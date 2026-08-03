"use server";

import { refresh } from "next/cache";

import { backendFetch } from "@/lib/backend-fetch";
import { brandFormSchema, type BrandFormInput } from "@/lib/schemas/brand";
import type { FilamentBrand } from "@/lib/types/brand";

function toPayload(values: BrandFormInput) {
  const parsed = brandFormSchema.parse(values);

  return {
    name: parsed.name,
    whereToBuy: parsed.whereToBuy || null,
    avgPriceMin: parsed.avgPriceMin ?? null,
    avgPriceMax: parsed.avgPriceMax ?? null,
    filamentTypes: parsed.filamentTypes ?? [],
    bestColors: parsed.bestColors ?? [],
    purchased: parsed.purchased ?? false,
    notes: parsed.notes || null,
  };
}

export async function getBrands(): Promise<FilamentBrand[]> {
  const response = await backendFetch("/brands", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar as marcas");
  }
  const body = await response.json();
  return body.data;
}

export async function getBrand(id: number): Promise<FilamentBrand | null> {
  const response = await backendFetch(`/brands/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar a marca");
  }
  const body = await response.json();
  return body.data;
}

export async function createBrandAction(values: BrandFormInput) {
  const response = await backendFetch("/brands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a marca");
  }

  refresh();
}

export async function updateBrandAction(id: number, values: BrandFormInput) {
  const response = await backendFetch(`/brands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a marca");
  }

  refresh();
}

export async function deleteBrandAction(id: number) {
  const response = await backendFetch(`/brands/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a marca");
  }

  refresh();
}
