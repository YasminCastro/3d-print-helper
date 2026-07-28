import { z } from "zod";

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const costBenefitOptions = ["baixo", "moderado", "bom", "otimo"] as const;

export const filamentTypeOptions = [
  "pla",
  "pla_matte",
  "pla_silk",
  "pla_duo_color",
  "pla_tri_color",
  "petg",
  "abs",
  "asa",
  "tpu",
  "nylon",
  "pva",
] as const;

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da marca"),
  whereToBuy: z.string().trim().optional(),
  avgPriceMin: optionalNumberInput,
  avgPriceMax: optionalNumberInput,
  filamentTypes: z.array(z.enum(filamentTypeOptions)).optional(),
  bestColors: z.array(z.string().trim().min(1)).optional(),
  purchased: z.boolean().optional(),
  notes: z.string().trim().optional(),
});

export type BrandFormInput = z.input<typeof brandFormSchema>;
export type BrandFormValues = z.infer<typeof brandFormSchema>;
