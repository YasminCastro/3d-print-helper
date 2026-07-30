"use server";

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { NEW_CATEGORY_VALUE } from "@/lib/schemas/print";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "prints");

async function savePhoto(file: File) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}${path.extname(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  return filename;
}

function removePhoto(filename: string | null) {
  if (!filename) return;
  fs.rm(path.join(UPLOAD_DIR, filename), { force: true }, () => {});
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

function resolveCategoryId(categoryId: string | null, newCategoryName: string | null) {
  if (categoryId === NEW_CATEGORY_VALUE) {
    const name = (newCategoryName ?? "").trim();
    if (!name) return null;

    const existing = db
      .prepare("SELECT id FROM print_categories WHERE name = ? COLLATE NOCASE")
      .get(name) as { id: number } | undefined;

    if (existing) return existing.id;

    const result = db
      .prepare("INSERT INTO print_categories (name) VALUES (?)")
      .run(name);

    return Number(result.lastInsertRowid);
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

function insertFilaments(
  printId: number,
  filaments: { filamentId: number | null; grams: number | null }[]
) {
  const insert = db.prepare(
    `INSERT INTO print_filaments (print_id, filament_id, grams, position)
     VALUES (@printId, @filamentId, @grams, @position)`
  );

  filaments.forEach((filament, index) => {
    insert.run({
      printId,
      filamentId: filament.filamentId,
      grams: filament.grams,
      position: index,
    });
  });
}

function parseFields(formData: FormData) {
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
  const profitPercent = parseNumber(formData.get("profitPercent"));

  const durationTotalMinutes =
    durationHours === null && durationMinutes === null
      ? null
      : (durationHours ?? 0) * 60 + (durationMinutes ?? 0);

  const categoryId = resolveCategoryId(categoryIdRaw, newCategoryName);
  const printerId = printerIdRaw ? Number(printerIdRaw) : null;
  const filaments = parseFilaments(formData);

  return {
    name,
    printDate,
    durationTotalMinutes,
    status,
    result,
    categoryId,
    printerId,
    printLink,
    profitPercent,
    filaments,
  };
}

export async function createPrintAction(formData: FormData) {
  const {
    name,
    printDate,
    durationTotalMinutes,
    status,
    result,
    categoryId,
    printerId,
    printLink,
    profitPercent,
    filaments,
  } = parseFields(formData);
  const photo = formData.get("photo");

  let filename: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    filename = await savePhoto(photo);
  }

  const transaction = db.transaction(() => {
    const insertResult = db
      .prepare(
        `INSERT INTO prints (name, photo_filename, print_date, duration_minutes, status, result, category_id, printer_id, print_link, profit_percent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        filename,
        printDate,
        durationTotalMinutes,
        status,
        result,
        categoryId,
        printerId,
        printLink,
        profitPercent
      );

    insertFilaments(Number(insertResult.lastInsertRowid), filaments);
  });

  transaction();

  refresh();
}

export async function updatePrintAction(id: number, formData: FormData) {
  const {
    name,
    printDate,
    durationTotalMinutes,
    status,
    result,
    categoryId,
    printerId,
    printLink,
    profitPercent,
    filaments,
  } = parseFields(formData);
  const photo = formData.get("photo");

  const current = db
    .prepare("SELECT photo_filename FROM prints WHERE id = ?")
    .get(id) as { photo_filename: string | null } | undefined;

  let filename = current?.photo_filename ?? null;
  if (photo instanceof File && photo.size > 0) {
    removePhoto(filename);
    filename = await savePhoto(photo);
  }

  const transaction = db.transaction(() => {
    db.prepare(
      `UPDATE prints
       SET name = ?, photo_filename = ?, print_date = ?, duration_minutes = ?,
           status = ?, result = ?, category_id = ?, printer_id = ?, print_link = ?, profit_percent = ?
       WHERE id = ?`
    ).run(
      name,
      filename,
      printDate,
      durationTotalMinutes,
      status,
      result,
      categoryId,
      printerId,
      printLink,
      profitPercent,
      id
    );

    db.prepare("DELETE FROM print_filaments WHERE print_id = ?").run(id);
    insertFilaments(id, filaments);
  });

  transaction();

  refresh();
}

export async function deletePrintAction(id: number) {
  const current = db
    .prepare("SELECT photo_filename FROM prints WHERE id = ?")
    .get(id) as { photo_filename: string | null } | undefined;

  db.prepare("DELETE FROM prints WHERE id = ?").run(id);

  if (current) removePhoto(current.photo_filename);

  refresh();
}
