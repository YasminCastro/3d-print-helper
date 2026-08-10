import { z } from 'zod';

export const printStatusOptions = ['fila', 'pronto'] as const;

export const printResultOptions = ['ruim', 'razoavel', 'bom', 'perfeito'] as const;

const optionalText = z.string().trim().nullable().optional();

export const createPrintCategorySchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: 'Invalid color' })
    .nullable()
    .optional(),
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
  notes: optionalText,
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

export const printSortOptions = [
  'newest',
  'oldest',
  'name_asc',
  'name_desc',
  'duration_desc',
  'duration_asc',
  'sale_value_desc',
  'sale_value_asc',
] as const;

export const printDurationRangeValues = ['ate_1h', '1h_3h', '3h_6h', '6h_mais'] as const;

export type PrintDurationRange = (typeof printDurationRangeValues)[number];

export const printDurationRangeBounds: Record<PrintDurationRange, { min: number; max: number | null }> = {
  ate_1h: { min: 0, max: 60 },
  '1h_3h': { min: 61, max: 180 },
  '3h_6h': { min: 181, max: 360 },
  '6h_mais': { min: 361, max: null },
};

function arrayQueryParam<T extends z.ZodTypeAny>(schema: T) {
  return z
    .preprocess((value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    }, z.array(schema))
    .optional();
}

export const listPrintsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(printSortOptions).optional(),
  search: z.string().trim().min(1).optional(),
  categoryId: arrayQueryParam(z.coerce.number().int().positive()),
  status: arrayQueryParam(z.enum(printStatusOptions)),
  result: arrayQueryParam(z.enum(printResultOptions)),
  duration: arrayQueryParam(z.enum(printDurationRangeValues)),
});

export type ListPrintsQueryDto = z.infer<typeof listPrintsQuerySchema>;
export type PrintSortOption = (typeof printSortOptions)[number];
