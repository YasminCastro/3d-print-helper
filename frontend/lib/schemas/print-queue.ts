import { z } from "zod";

import { printExtraItemSchema, printFilamentSchema, printResultOptions } from "@/lib/schemas/print";

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const printQueueSortOptions = [
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "duration_desc",
  "duration_asc",
  "sale_value_desc",
  "sale_value_asc",
] as const;

export type PrintQueueSortOption = (typeof printQueueSortOptions)[number];

export const printQueueSortLabels: Record<PrintQueueSortOption, string> = {
  newest: "Novidades",
  oldest: "Mais antigos",
  name_asc: "Ordem alfabética (A-Z)",
  name_desc: "Ordem alfabética (Z-A)",
  duration_desc: "Maior tempo de impressão",
  duration_asc: "Menor tempo de impressão",
  sale_value_desc: "Maior valor de venda",
  sale_value_asc: "Menor valor de venda",
};

export const printQueueFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome"),
  durationHours: optionalNumberInput,
  durationMinutes: optionalNumberInput,
  categoryId: z.string().trim().optional(),
  newCategoryName: z.string().trim().optional(),
  printerId: z.string().trim().optional(),
  filaments: z.array(printFilamentSchema).optional(),
  extraItems: z.array(printExtraItemSchema).optional(),
  printLink: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  profitPercent: optionalNumberInput,
});

export type PrintQueueFormInput = z.input<typeof printQueueFormSchema>;
export type PrintQueueFormValues = z.infer<typeof printQueueFormSchema>;

export const markPrintQueueItemAsPrintedFormSchema = z.object({
  printDate: z.string().trim().optional(),
  result: z.enum(printResultOptions).optional(),
  saleValueActual: optionalNumberInput,
});

export type MarkPrintQueueItemAsPrintedFormInput = z.input<
  typeof markPrintQueueItemAsPrintedFormSchema
>;
export type MarkPrintQueueItemAsPrintedFormValues = z.infer<
  typeof markPrintQueueItemAsPrintedFormSchema
>;

export { NEW_CATEGORY_VALUE } from "@/lib/schemas/print";
