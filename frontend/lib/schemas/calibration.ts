import { z } from "zod";

export const slicerOptions = ["orca", "creality"] as const;

export const calibrationStatusOptions = ["calibrado", "nao_calibrado", "em_processo"] as const;

const optionalNumberInput = z
  .union([z.number(), z.nan()])
  .optional()
  .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value));

export const calibrationFormSchema = z.object({
  slicer: z.enum(slicerOptions, { message: "Selecione o fatiador" }),
  filamentId: z.string().trim().min(1, "Selecione o filamento"),
  status: z.enum(calibrationStatusOptions).optional(),
  calibrationDate: z.string().trim().optional(),
  bedTempFirstLayer: optionalNumberInput,
  bedTempOtherLayers: optionalNumberInput,
  nozzleTempInitial: optionalNumberInput,
  nozzleTempFinal: optionalNumberInput,
  maxVolumetricSpeed: optionalNumberInput,
  pressureAdvance: optionalNumberInput,
  flowRatio: optionalNumberInput,
  retractionDistance: optionalNumberInput,
  purchaseBatch: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CalibrationFormInput = z.input<typeof calibrationFormSchema>;
export type CalibrationFormValues = z.infer<typeof calibrationFormSchema>;
