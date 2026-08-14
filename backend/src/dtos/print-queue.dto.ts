import { z } from 'zod';
import { arrayQueryParam, printResultOptions } from '@dtos/prints.dto';

const optionalText = z.string().trim().nullable().optional();

export const printQueueFilamentInputSchema = z.object({
  filamentId: z.number().int().positive().nullable().optional(),
  grams: z.number().nullable().optional(),
});

export const printQueueExtraItemInputSchema = z.object({
  extraItemId: z.number().int().positive().nullable().optional(),
  quantity: z.number().nullable().optional(),
});

export const createPrintQueueItemSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  durationMinutes: z.number().int().nonnegative().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  printerId: z.number().int().positive().nullable().optional(),
  printLink: optionalText,
  notes: optionalText,
  profitPercent: z.number().nullable().optional(),
  filaments: z.array(printQueueFilamentInputSchema).optional(),
  extraItems: z.array(printQueueExtraItemInputSchema).optional(),
});

export type CreatePrintQueueItemDto = z.infer<typeof createPrintQueueItemSchema>;

export const updatePrintQueueItemSchema = createPrintQueueItemSchema.partial();

export type UpdatePrintQueueItemDto = z.infer<typeof updatePrintQueueItemSchema>;

export const markPrintQueueItemAsPrintedSchema = z.object({
  printDate: optionalText,
  result: z.enum(printResultOptions).nullable().optional(),
  saleValueActual: z.number().nullable().optional(),
  photo: z
    .object({
      filename: z.string().trim().min(1, { message: 'Filename is required' }),
      mimeType: z.string().trim().min(1, { message: 'Mime type is required' }),
      data: z.string().trim().min(1, { message: 'Photo data is required' }),
    })
    .nullable()
    .optional(),
});

export type MarkPrintQueueItemAsPrintedDto = z.infer<typeof markPrintQueueItemAsPrintedSchema>;

export const printQueueSortOptions = [
  'newest',
  'oldest',
  'name_asc',
  'name_desc',
  'duration_asc',
  'duration_desc',
  'sale_value_asc',
  'sale_value_desc',
] as const;

export const listPrintQueueQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(printQueueSortOptions).optional(),
  search: z.string().trim().min(1).optional(),
  categoryId: arrayQueryParam(z.coerce.number().int().positive()),
  printerId: arrayQueryParam(z.coerce.number().int().positive()),
});

export type ListPrintQueueQueryDto = z.infer<typeof listPrintQueueQuerySchema>;
export type PrintQueueSortOption = (typeof printQueueSortOptions)[number];
