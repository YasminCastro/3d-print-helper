import { z } from "zod";

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const printStatusOptions = ["fila", "pronto"] as const;

export const printResultOptions = ["ruim", "razoavel", "bom", "perfeito"] as const;

export const NEW_CATEGORY_VALUE = "__new__";

export const printFilamentSchema = z.object({
  filamentId: z.string().trim().optional(),
  grams: optionalNumberInput,
});

export const printExtraItemSchema = z.object({
  extraItemId: z.string().trim().optional(),
  quantity: optionalNumberInput,
});

export const printFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome"),
  printDate: z.string().trim().optional(),
  durationHours: optionalNumberInput,
  durationMinutes: optionalNumberInput,
  status: z.enum(printStatusOptions).optional(),
  result: z.enum(printResultOptions).optional(),
  categoryId: z.string().trim().optional(),
  newCategoryName: z.string().trim().optional(),
  printerId: z.string().trim().optional(),
  filaments: z.array(printFilamentSchema).optional(),
  extraItems: z.array(printExtraItemSchema).optional(),
  printLink: z.string().trim().optional(),
  profitPercent: optionalNumberInput,
  saleValueActual: optionalNumberInput,
});

export type PrintFormInput = z.input<typeof printFormSchema>;
export type PrintFormValues = z.infer<typeof printFormSchema>;
