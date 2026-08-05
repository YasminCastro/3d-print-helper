import { z } from 'zod';

export const createExtraItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(150, { message: 'Name is too long (max 150 characters)' }),
  cost: z.number().nonnegative(),
});

export type CreateExtraItemDto = z.infer<typeof createExtraItemSchema>;

export const updateExtraItemSchema = createExtraItemSchema.partial();

export type UpdateExtraItemDto = z.infer<typeof updateExtraItemSchema>;
