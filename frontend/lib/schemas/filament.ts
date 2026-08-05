import { z } from "zod";

import { filamentTypeOptions } from "@/lib/schemas/brand";

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const availabilityOptions = ["disponivel", "indisponivel", "quase_acabando"] as const;

export const filamentFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do filamento"),
  availability: z.enum(availabilityOptions).optional(),
  lastPurchaseDate: z.string().trim().optional(),
  material: z.enum(filamentTypeOptions).optional(),
  brandId: z.string().trim().optional(),
  purchaseLink: z.string().trim().optional(),
  saleName: z.string().trim().optional(),
  minPricePaid: optionalNumberInput,
  maxPricePaid: optionalNumberInput,
  nozzleTempMin: optionalNumberInput,
  nozzleTempMax: optionalNumberInput,
  bedTempMin: optionalNumberInput,
  bedTempMax: optionalNumberInput,
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  color: z.string().trim().optional(),
  color2: z.string().trim().optional(),
});

export type FilamentFormInput = z.input<typeof filamentFormSchema>;
export type FilamentFormValues = z.infer<typeof filamentFormSchema>;
