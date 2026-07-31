"use server";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { filamentFormSchema, type FilamentFormInput } from "@/lib/schemas/filament";
import { getBrands } from "@/lib/actions/brands";
import type { FilamentOption } from "@/lib/types/filament";

function toRow(values: FilamentFormInput) {
  const parsed = filamentFormSchema.parse(values);

  return {
    name: parsed.name,
    availability: parsed.availability ?? null,
    lastPurchaseDate: parsed.lastPurchaseDate || null,
    material: parsed.material ?? null,
    brandId: parsed.brandId ? Number(parsed.brandId) : null,
    purchaseLink: parsed.purchaseLink ?? null,
    saleName: parsed.saleName ?? null,
    minPricePaid: parsed.minPricePaid ?? null,
    maxPricePaid: parsed.maxPricePaid ?? null,
    nozzleTempMin: parsed.nozzleTempMin ?? null,
    nozzleTempMax: parsed.nozzleTempMax ?? null,
    bedTempMin: parsed.bedTempMin ?? null,
    bedTempMax: parsed.bedTempMax ?? null,
    purchaseBatch: parsed.purchaseBatch ?? null,
    rating: parsed.rating ?? null,
    color: parsed.color ?? null,
  };
}

export async function createFilamentAction(values: FilamentFormInput) {
  const row = toRow(values);

  db.prepare(
    `INSERT INTO filaments (name, availability, last_purchase_date, material, brand_id, purchase_link, sale_name, min_price_paid, max_price_paid, nozzle_temp_min, nozzle_temp_max, bed_temp_min, bed_temp_max, purchase_batch, rating, color)
     VALUES (@name, @availability, @lastPurchaseDate, @material, @brandId, @purchaseLink, @saleName, @minPricePaid, @maxPricePaid, @nozzleTempMin, @nozzleTempMax, @bedTempMin, @bedTempMax, @purchaseBatch, @rating, @color)`
  ).run(row);

  refresh();
}

export async function updateFilamentAction(id: number, values: FilamentFormInput) {
  const row = toRow(values);

  db.prepare(
    `UPDATE filaments
     SET name = @name,
         availability = @availability,
         last_purchase_date = @lastPurchaseDate,
         material = @material,
         brand_id = @brandId,
         purchase_link = @purchaseLink,
         sale_name = @saleName,
         min_price_paid = @minPricePaid,
         max_price_paid = @maxPricePaid,
         nozzle_temp_min = @nozzleTempMin,
         nozzle_temp_max = @nozzleTempMax,
         bed_temp_min = @bedTempMin,
         bed_temp_max = @bedTempMax,
         purchase_batch = @purchaseBatch,
         rating = @rating,
         color = @color
     WHERE id = @id`
  ).run({ ...row, id });

  refresh();
}

export async function deleteFilamentAction(id: number) {
  db.prepare("DELETE FROM filaments WHERE id = ?").run(id);

  refresh();
}

export async function getFilamentOptions(): Promise<FilamentOption[]> {
  const brands = await getBrands();
  const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));

  const filaments = db
    .prepare(
      `SELECT id, name, color, material, brand_id
       FROM filaments
       ORDER BY name ASC`
    )
    .all() as { id: number; name: string; color: string | null; material: string | null; brand_id: number | null }[];

  return filaments.map((filament) => ({
    id: filament.id,
    name: filament.name,
    color: filament.color,
    material: filament.material,
    brand_name: filament.brand_id != null ? (brandsById.get(filament.brand_id) ?? null) : null,
  }));
}
