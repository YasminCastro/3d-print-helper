import { z } from 'zod';
import { filamentTypeOptions } from '@dtos/brands.dto';

export const availabilityOptions = ['disponivel', 'indisponivel', 'quase_acabando'] as const;

const optionalNumber = z.number().nonnegative().nullable().optional();

const optionalText = z
  .string()
  .trim()
  .max(150, { message: 'Value is too long (max 150 characters)' })
  .nullable()
  .optional();

export const createFilamentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(150, { message: 'Name is too long (max 150 characters)' }),
  availability: z.enum(availabilityOptions).nullable().optional(),
  lastPurchaseDate: optionalText,
  material: z.enum(filamentTypeOptions).nullable().optional(),
  brandId: z.number().int().positive().nullable().optional(),
  purchaseLink: optionalText,
  saleName: optionalText,
  minPricePaid: optionalNumber,
  maxPricePaid: optionalNumber,
  nozzleTempMin: z.number().int().nullable().optional(),
  nozzleTempMax: z.number().int().nullable().optional(),
  bedTempMin: z.number().int().nullable().optional(),
  bedTempMax: z.number().int().nullable().optional(),
  purchaseBatch: optionalText,
  rating: z.number().int().min(1).max(5).nullable().optional(),
  color: optionalText,
});

export type CreateFilamentDto = z.infer<typeof createFilamentSchema>;

export const updateFilamentSchema = createFilamentSchema.partial();

export type UpdateFilamentDto = z.infer<typeof updateFilamentSchema>;
