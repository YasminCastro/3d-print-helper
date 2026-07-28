import { z } from "zod";

export const journalStatusOptions = ["resolvido", "nao_resolvido", "em_andamento"] as const;

export const journalAttemptSchema = z.object({
  attempt: z.string().trim().optional(),
  worked: z.boolean().optional(),
});

export const journalFormSchema = z.object({
  title: z.string().trim().min(1, "Informe um título"),
  entryDate: z.string().trim().optional(),
  filamentId: z.string().trim().optional(),
  status: z.enum(journalStatusOptions).optional(),
  symptom: z.string().trim().optional(),
  possibleCauses: z.string().trim().optional(),
  attempts: z.array(journalAttemptSchema).optional(),
  notes: z.string().trim().optional(),
});

export type JournalFormInput = z.input<typeof journalFormSchema>;
export type JournalFormValues = z.infer<typeof journalFormSchema>;
