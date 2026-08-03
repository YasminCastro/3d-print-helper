"use server";

import { refresh } from "next/cache";

import { backendFetch } from "@/lib/backend-fetch";
import { journalFormSchema, type JournalFormInput } from "@/lib/schemas/journal";
import type { JournalEntryWithAttempts } from "@/lib/types/journal";

type ApiJournalAttempt = {
  id?: number;
  position: number;
  attempt: string | null;
  worked: number | null;
};

type ApiJournalPhoto = {
  id: number;
  filename: string;
  mimeType: string;
  createdAt: string;
};

type ApiJournalEntry = {
  id: number;
  title: string;
  entryDate: string | null;
  filamentId: number | null;
  status: string | null;
  symptom: string | null;
  possibleCauses: string | null;
  notes: string | null;
  createdAt: string;
  attempts: ApiJournalAttempt[];
  photos: ApiJournalPhoto[];
};

function toDomain(api: ApiJournalEntry): JournalEntryWithAttempts {
  return {
    id: api.id,
    title: api.title,
    entry_date: api.entryDate,
    filament_id: api.filamentId,
    status: api.status,
    symptom: api.symptom,
    possible_causes: api.possibleCauses,
    notes: api.notes,
    created_at: api.createdAt,
    attempts: api.attempts.map((attempt) => ({
      id: attempt.id,
      position: attempt.position,
      attempt: attempt.attempt,
      worked: attempt.worked,
    })),
    photos: api.photos.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      mime_type: photo.mimeType,
      created_at: photo.createdAt,
    })),
  };
}

function toPayload(values: JournalFormInput) {
  const parsed = journalFormSchema.parse(values);

  return {
    title: parsed.title,
    entryDate: parsed.entryDate || null,
    filamentId: parsed.filamentId ? Number(parsed.filamentId) : null,
    status: parsed.status ?? null,
    symptom: parsed.symptom ?? null,
    possibleCauses: parsed.possibleCauses ?? null,
    notes: parsed.notes ?? null,
    attempts: (parsed.attempts ?? [])
      .filter((attempt) => attempt.attempt || attempt.worked !== undefined)
      .map((attempt) => ({
        attempt: attempt.attempt ?? null,
        worked: attempt.worked ?? null,
      })),
  };
}

export async function getJournalEntries(): Promise<JournalEntryWithAttempts[]> {
  const response = await backendFetch("/journal-entries", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar o diário");
  }
  const body = await response.json();
  return (body.data as ApiJournalEntry[]).map(toDomain);
}

export async function getJournalEntry(id: number): Promise<JournalEntryWithAttempts | null> {
  const response = await backendFetch(`/journal-entries/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar a entrada do diário");
  }
  const body = await response.json();
  return toDomain(body.data);
}

export async function createJournalEntryAction(values: JournalFormInput): Promise<number> {
  const response = await backendFetch("/journal-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a entrada do diário");
  }

  const body = await response.json();
  const entry = body.data as ApiJournalEntry;

  refresh();

  return entry.id;
}

export async function updateJournalEntryAction(id: number, values: JournalFormInput) {
  const response = await backendFetch(`/journal-entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a entrada do diário");
  }

  refresh();
}

export async function deleteJournalEntryAction(id: number) {
  const response = await backendFetch(`/journal-entries/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a entrada do diário");
  }

  refresh();
}

export async function addJournalPhotosAction(entryId: number, formData: FormData) {
  const files = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) return;

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await backendFetch(`/journal-entries/${entryId}/photos`, {
      method: "POST",
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

  refresh();
}

export async function deleteJournalPhotoAction(photoId: number) {
  const response = await backendFetch(`/journal-entries/photos/${photoId}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a foto");
  }

  refresh();
}

