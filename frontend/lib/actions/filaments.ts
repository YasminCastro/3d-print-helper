"use server";

import { refresh } from "next/cache";

import { backendFetch } from "@/lib/backend-fetch";
import { filamentFormSchema, type FilamentFormInput } from "@/lib/schemas/filament";
import { getBrands } from "@/lib/actions/brands";
import type { Filament, FilamentOption, FilamentWithBrand } from "@/lib/types/filament";

type ApiFilament = {
  id: number;
  name: string;
  availability: string | null;
  lastPurchaseDate: string | null;
  material: string | null;
  brandId: number | null;
  purchaseLink: string | null;
  saleName: string | null;
  minPricePaid: number | null;
  maxPricePaid: number | null;
  nozzleTempMin: number | null;
  nozzleTempMax: number | null;
  bedTempMin: number | null;
  bedTempMax: number | null;
  rating: number | null;
  color: string | null;
  color2: string | null;
  createdAt: string;
};

function toDomain(api: ApiFilament): Filament {
  return {
    id: api.id,
    name: api.name,
    availability: api.availability,
    last_purchase_date: api.lastPurchaseDate,
    material: api.material,
    brand_id: api.brandId,
    purchase_link: api.purchaseLink,
    sale_name: api.saleName,
    min_price_paid: api.minPricePaid,
    max_price_paid: api.maxPricePaid,
    nozzle_temp_min: api.nozzleTempMin,
    nozzle_temp_max: api.nozzleTempMax,
    bed_temp_min: api.bedTempMin,
    bed_temp_max: api.bedTempMax,
    rating: api.rating,
    color: api.color,
    color2: api.color2,
    created_at: api.createdAt,
  };
}

function toPayload(values: FilamentFormInput) {
  const parsed = filamentFormSchema.parse(values);

  return {
    name: parsed.name,
    availability: parsed.availability ?? null,
    lastPurchaseDate: parsed.lastPurchaseDate || null,
    material: parsed.material ?? null,
    brandId: parsed.brandId ? Number(parsed.brandId) : null,
    purchaseLink: parsed.purchaseLink || null,
    saleName: parsed.saleName || null,
    minPricePaid: parsed.minPricePaid ?? null,
    maxPricePaid: parsed.maxPricePaid ?? null,
    nozzleTempMin: parsed.nozzleTempMin ?? null,
    nozzleTempMax: parsed.nozzleTempMax ?? null,
    bedTempMin: parsed.bedTempMin ?? null,
    bedTempMax: parsed.bedTempMax ?? null,
    rating: parsed.rating ?? null,
    color: parsed.color || null,
    color2: parsed.color2 || null,
  };
}

export async function getFilaments(): Promise<Filament[]> {
  const response = await backendFetch("/filaments", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar os filamentos");
  }
  const body = await response.json();
  return (body.data as ApiFilament[]).map(toDomain);
}

export async function getFilament(id: number): Promise<Filament | null> {
  const response = await backendFetch(`/filaments/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar o filamento");
  }
  const body = await response.json();
  return toDomain(body.data);
}

export async function createFilamentAction(values: FilamentFormInput) {
  const response = await backendFetch("/filaments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar o filamento");
  }

  refresh();
}

export async function updateFilamentAction(id: number, values: FilamentFormInput) {
  const response = await backendFetch(`/filaments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar o filamento");
  }

  refresh();
}

export async function deleteFilamentAction(id: number) {
  const response = await backendFetch(`/filaments/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir o filamento");
  }

  refresh();
}

export async function getFilamentsWithBrand(): Promise<FilamentWithBrand[]> {
  const [filaments, brands] = await Promise.all([getFilaments(), getBrands()]);
  const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));

  return filaments.map((filament) => ({
    ...filament,
    brand_name: filament.brand_id != null ? (brandsById.get(filament.brand_id) ?? null) : null,
  }));
}

export async function getFilamentOptions(): Promise<FilamentOption[]> {
  const filamentsWithBrand = await getFilamentsWithBrand();

  return filamentsWithBrand.map((filament) => ({
    id: filament.id,
    name: filament.name,
    color: filament.color,
    color2: filament.color2,
    material: filament.material,
    brand_name: filament.brand_name,
  }));
}

export async function getFilamentPricingData() {
  const filaments = await getFilaments();

  const filamentsById = new Map(
    filaments.map((filament) => [
      filament.id,
      {
        material: filament.material,
        min_price_paid: filament.min_price_paid,
        max_price_paid: filament.max_price_paid,
      },
    ])
  );

  const materialMaxPrices: Record<string, number> = {};
  for (const filament of filaments) {
    if (!filament.material) continue;
    const price = filament.max_price_paid ?? filament.min_price_paid;
    if (price == null) continue;
    if (materialMaxPrices[filament.material] == null || price > materialMaxPrices[filament.material]) {
      materialMaxPrices[filament.material] = price;
    }
  }

  return { filamentsById, materialMaxPrices };
}
