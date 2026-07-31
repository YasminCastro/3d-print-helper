import { z } from 'zod';

export const filamentTypeOptions = [
  'pla',
  'pla_matte',
  'pla_silk',
  'pla_duo_color',
  'pla_tri_color',
  'petg',
  'abs',
  'asa',
  'tpu',
  'nylon',
  'pva',
] as const;

const optionalNumber = z.number().nonnegative().nullable().optional();

const optionalText = z
  .string()
  .trim()
  .max(150, { message: 'Value is too long (max 150 characters)' })
  .nullable()
  .optional();

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(150, { message: 'Name is too long (max 150 characters)' }),
  whereToBuy: optionalText,
  avgPriceMin: optionalNumber,
  avgPriceMax: optionalNumber,
  filamentTypes: z.array(z.enum(filamentTypeOptions)).nullable().optional(),
  bestColors: z.array(z.string().trim().min(1)).nullable().optional(),
  purchased: z.boolean().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = createBrandSchema.partial();

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
