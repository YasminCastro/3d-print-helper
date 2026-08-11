import { z } from "zod";

export const extrusionTypeOptions = ["direct_drive", "bowden"] as const;

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const printerFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da impressora"),
  brand: z.string().trim().optional(),
  powerConsumptionW: optionalNumberInput,
  maintenanceCostPerHour: optionalNumberInput,
  purchasePrice: optionalNumberInput,
  lifespanHours: optionalNumberInput,
  energyCostPerKwh: optionalNumberInput,
  extrusionType: z.enum(extrusionTypeOptions).optional(),
  color: z
    .string()
    .trim()
    .refine((value) => value === "" || /^#[0-9a-fA-F]{6}$/.test(value), "Cor inválida")
    .optional(),
});

export type PrinterFormInput = z.input<typeof printerFormSchema>;
export type PrinterFormValues = z.infer<typeof printerFormSchema>;
