import { z } from 'zod';

export const printStatusOptions = ['fila', 'pronto'] as const;

export const printResultOptions = ['ruim', 'razoavel', 'bom', 'perfeito'] as const;

const optionalText = z.string().trim().nullable().optional();

export const createPrintCategorySchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
});

export type CreatePrintCategoryDto = z.infer<typeof createPrintCategorySchema>;

export const updatePrintCategorySchema = createPrintCategorySchema.partial();

export type UpdatePrintCategoryDto = z.infer<typeof updatePrintCategorySchema>;

export const printFilamentInputSchema = z.object({
  filamentId: z.number().int().positive().nullable().optional(),
  grams: z.number().nullable().optional(),
});

export const printExtraItemInputSchema = z.object({
  extraItemId: z.number().int().positive().nullable().optional(),
  quantity: z.number().nullable().optional(),
});

export const createPrintSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  printDate: optionalText,
  durationMinutes: z.number().int().nonnegative().nullable().optional(),
  status: z.enum(printStatusOptions).nullable().optional(),
  result: z.enum(printResultOptions).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  printerId: z.number().int().positive().nullable().optional(),
  printLink: optionalText,
  profitPercent: z.number().nullable().optional(),
  saleValueActual: z.number().nullable().optional(),
  filaments: z.array(printFilamentInputSchema).optional(),
  extraItems: z.array(printExtraItemInputSchema).optional(),
});

export type CreatePrintDto = z.infer<typeof createPrintSchema>;

export const updatePrintSchema = createPrintSchema.partial();

export type UpdatePrintDto = z.infer<typeof updatePrintSchema>;

export const addPrintPhotoSchema = z.object({
  filename: z.string().trim().min(1, { message: 'Filename is required' }),
  mimeType: z.string().trim().min(1, { message: 'Mime type is required' }),
  data: z.string().trim().min(1, { message: 'Photo data is required' }),
});

export type AddPrintPhotoDto = z.infer<typeof addPrintPhotoSchema>;
