import { z } from 'zod';

export const slicerOptions = ['orca', 'creality'] as const;

export const calibrationStatusOptions = ['calibrado', 'nao_calibrado', 'em_processo'] as const;

const optionalNumber = z.number().nullable().optional();

const optionalText = z
  .string()
  .trim()
  .max(150, { message: 'Value is too long (max 150 characters)' })
  .nullable()
  .optional();

export const createCalibrationSchema = z.object({
  slicer: z.enum(slicerOptions, { message: 'Slicer is required' }),
  filamentId: z.number().int().positive({ message: 'Filament is required' }),
  printerId: z.number().int().positive().nullable().optional(),
  status: z.enum(calibrationStatusOptions).nullable().optional(),
  calibrationDate: optionalText,
  bedTempFirstLayer: optionalNumber,
  bedTempOtherLayers: optionalNumber,
  nozzleTempInitial: optionalNumber,
  nozzleTempFinal: optionalNumber,
  maxVolumetricSpeed: optionalNumber,
  pressureAdvance: optionalNumber,
  flowRatio: optionalNumber,
  retractionDistance: optionalNumber,
  purchaseBatch: optionalText,
  notes: z.string().trim().nullable().optional(),
});

export type CreateCalibrationDto = z.infer<typeof createCalibrationSchema>;

export const updateCalibrationSchema = createCalibrationSchema.partial();

export type UpdateCalibrationDto = z.infer<typeof updateCalibrationSchema>;
