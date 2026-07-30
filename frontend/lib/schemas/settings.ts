import { z } from "zod";

export const settingsFormSchema = z.object({
  defaultProfitPercent: z
    .union([z.number(), z.nan()])
    .refine((value) => !Number.isNaN(value), "Informe um valor"),
});

export type SettingsFormInput = z.input<typeof settingsFormSchema>;
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
