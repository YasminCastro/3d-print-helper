import { z } from 'zod';

export const journalStatusOptions = ['resolvido', 'nao_resolvido', 'em_andamento'] as const;

const optionalText = z.string().trim().nullable().optional();

export const journalAttemptSchema = z.object({
  attempt: z.string().trim().nullable().optional(),
  worked: z.boolean().nullable().optional(),
});

export const createJournalEntrySchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
  entryDate: optionalText,
  filamentId: z.number().int().positive().nullable().optional(),
  status: z.enum(journalStatusOptions).nullable().optional(),
  symptom: optionalText,
  possibleCauses: optionalText,
  notes: optionalText,
  attempts: z.array(journalAttemptSchema).optional(),
});

export type CreateJournalEntryDto = z.infer<typeof createJournalEntrySchema>;

export const updateJournalEntrySchema = createJournalEntrySchema.partial();

export type UpdateJournalEntryDto = z.infer<typeof updateJournalEntrySchema>;

export const addJournalPhotoSchema = z.object({
  filename: z.string().trim().min(1, { message: 'Filename is required' }),
  mimeType: z.string().trim().min(1, { message: 'Mime type is required' }),
  data: z.string().trim().min(1, { message: 'Photo data is required' }),
});

export type AddJournalPhotoDto = z.infer<typeof addJournalPhotoSchema>;
