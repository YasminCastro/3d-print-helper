import { z } from 'zod';

const optionalNumber = z.number().nonnegative().nullable().optional();

const optionalText = z
  .string()
  .trim()
  .max(150, { message: 'Value is too long (max 150 characters)' })
  .nullable()
  .optional();

export const createPrinterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(150, { message: 'Name is too long (max 150 characters)' }),
  model: optionalText,
  brand: optionalText,
  powerConsumptionW: optionalNumber,
  maintenanceCostPerHour: optionalNumber,
  purchasePrice: optionalNumber,
  lifespanHours: optionalNumber,
  energyCostPerKwh: optionalNumber,
});

export type CreatePrinterDto = z.infer<typeof createPrinterSchema>;

export const updatePrinterSchema = createPrinterSchema.partial();

export type UpdatePrinterDto = z.infer<typeof updatePrinterSchema>;
