import { z } from "zod";

export const printCategoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria"),
  color: z
    .string()
    .trim()
    .refine((value) => value === "" || /^#[0-9a-fA-F]{6}$/.test(value), "Cor inválida")
    .optional(),
});

export type PrintCategoryFormInput = z.input<typeof printCategoryFormSchema>;
export type PrintCategoryFormValues = z.infer<typeof printCategoryFormSchema>;
