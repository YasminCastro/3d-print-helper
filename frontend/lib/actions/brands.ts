"use server";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { brandFormSchema, type BrandFormInput } from "@/lib/schemas/brand";

function toRow(values: BrandFormInput) {
  const parsed = brandFormSchema.parse(values);

  return {
    name: parsed.name,
    whereToBuy: parsed.whereToBuy ?? null,
    avgPriceMin: parsed.avgPriceMin ?? null,
    avgPriceMax: parsed.avgPriceMax ?? null,
    filamentTypes: parsed.filamentTypes?.length ? parsed.filamentTypes.join(",") : null,
    bestColors: parsed.bestColors?.length ? parsed.bestColors.join(",") : null,
    purchased: parsed.purchased ? 1 : 0,
    notes: parsed.notes ?? null,
  };
}

export async function createBrandAction(values: BrandFormInput) {
  const row = toRow(values);

  db.prepare(
    `INSERT INTO filament_brands (name, where_to_buy, avg_price_min, avg_price_max, filament_types, best_colors, purchased, notes)
     VALUES (@name, @whereToBuy, @avgPriceMin, @avgPriceMax, @filamentTypes, @bestColors, @purchased, @notes)`
  ).run(row);

  refresh();
}

export async function updateBrandAction(id: number, values: BrandFormInput) {
  const row = toRow(values);

  db.prepare(
    `UPDATE filament_brands
     SET name = @name,
         where_to_buy = @whereToBuy,
         avg_price_min = @avgPriceMin,
         avg_price_max = @avgPriceMax,
         filament_types = @filamentTypes,
         best_colors = @bestColors,
         purchased = @purchased,
         notes = @notes
     WHERE id = @id`
  ).run({ ...row, id });

  refresh();
}

export async function deleteBrandAction(id: number) {
  db.prepare("DELETE FROM filament_brands WHERE id = ?").run(id);

  refresh();
}
