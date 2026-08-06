import { z } from "zod";

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const printStatusOptions = ["fila", "pronto"] as const;

export const printResultOptions = ["ruim", "razoavel", "bom", "perfeito"] as const;

export const NEW_CATEGORY_VALUE = "__new__";

export const printSortOptions = [
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "duration_desc",
  "duration_asc",
  "sale_value_desc",
  "sale_value_asc",
] as const;

export type PrintSortOption = (typeof printSortOptions)[number];

export const printDurationRangeOptions = [
  { value: "ate_1h", label: "Até 1h" },
  { value: "1h_3h", label: "1h - 3h" },
  { value: "3h_6h", label: "3h - 6h" },
  { value: "6h_mais", label: "6h+" },
] as const;

export type PrintDurationRange = (typeof printDurationRangeOptions)[number]["value"];

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
  notes: z.string().trim().optional(),
  profitPercent: optionalNumberInput,
  saleValueActual: optionalNumberInput,
});

export type PrintFormInput = z.input<typeof printFormSchema>;
export type PrintFormValues = z.infer<typeof printFormSchema>;
