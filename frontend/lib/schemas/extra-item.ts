import { z } from "zod";

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const extraItemFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do item"),
  cost: optionalNumberInput,
});

export type ExtraItemFormInput = z.input<typeof extraItemFormSchema>;
export type ExtraItemFormValues = z.infer<typeof extraItemFormSchema>;
