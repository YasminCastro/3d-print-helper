"use server";

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { journalFormSchema, type JournalFormInput } from "@/lib/schemas/journal";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "journal");

function toRow(values: JournalFormInput) {
  const parsed = journalFormSchema.parse(values);

  return {
    entry: {
      title: parsed.title,
      entryDate: parsed.entryDate || null,
      filamentId: parsed.filamentId ? Number(parsed.filamentId) : null,
      status: parsed.status ?? null,
      symptom: parsed.symptom ?? null,
      possibleCauses: parsed.possibleCauses ?? null,
      notes: parsed.notes ?? null,
    },
    attempts: (parsed.attempts ?? []).filter(
      (attempt) => attempt.attempt || attempt.worked !== undefined
    ),
  };
}

function insertAttempts(
  entryId: number,
  attempts: { attempt?: string; worked?: boolean }[]
) {
  const insert = db.prepare(
    `INSERT INTO journal_attempts (entry_id, position, attempt, worked)
     VALUES (@entryId, @position, @attempt, @worked)`
  );

  attempts.forEach((attempt, index) => {
    insert.run({
      entryId,
      position: index,
      attempt: attempt.attempt ?? null,
      worked: attempt.worked === undefined ? null : Number(attempt.worked),
    });
  });
}

export async function createJournalEntryAction(values: JournalFormInput) {
  const { entry, attempts } = toRow(values);

  let insertedId = 0;

  const transaction = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO journal_entries (title, entry_date, filament_id, status, symptom, possible_causes, notes)
         VALUES (@title, @entryDate, @filamentId, @status, @symptom, @possibleCauses, @notes)`
      )
      .run(entry);

    insertedId = Number(result.lastInsertRowid);
    insertAttempts(insertedId, attempts);
  });

  transaction();

  refresh();

  return insertedId;
}

export async function updateJournalEntryAction(id: number, values: JournalFormInput) {
  const { entry, attempts } = toRow(values);

  const transaction = db.transaction(() => {
    db.prepare(
      `UPDATE journal_entries
       SET title = @title,
           entry_date = @entryDate,
           filament_id = @filamentId,
           status = @status,
           symptom = @symptom,
           possible_causes = @possibleCauses,
           notes = @notes
       WHERE id = @id`
    ).run({ ...entry, id });

    db.prepare("DELETE FROM journal_attempts WHERE entry_id = ?").run(id);
    insertAttempts(id, attempts);
  });

  transaction();

  refresh();
}

export async function deleteJournalEntryAction(id: number) {
  db.prepare("DELETE FROM journal_entries WHERE id = ?").run(id);

  refresh();
}

export async function addJournalPhotosAction(entryId: number, formData: FormData) {
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) return;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const insert = db.prepare(
    "INSERT INTO journal_photos (entry_id, filename) VALUES (?, ?)"
  );

  for (const file of files) {
    const filename = `${randomUUID()}${path.extname(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    insert.run(entryId, filename);
  }

  refresh();
}

export async function deleteJournalPhotoAction(photoId: number) {
  const photo = db
    .prepare("SELECT filename FROM journal_photos WHERE id = ?")
    .get(photoId) as { filename: string } | undefined;

  db.prepare("DELETE FROM journal_photos WHERE id = ?").run(photoId);

  if (photo) {
    fs.rm(path.join(UPLOAD_DIR, photo.filename), { force: true }, () => {});
  }

  refresh();
}
