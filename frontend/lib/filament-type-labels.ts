import type { filamentTypeOptions } from "@/lib/schemas/brand";

export const filamentTypeLabels: Record<(typeof filamentTypeOptions)[number], string> = {
  pla: "PLA",
  pla_matte: "PLA Matte",
  pla_silk: "PLA Silk",
  pla_duo_color: "PLA Duo Color",
  petg: "PETG",
  abs: "ABS",
  tpu: "TPU",
};

export const filamentTypeColors: Record<(typeof filamentTypeOptions)[number], string> = {
  pla: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_matte:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_silk:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_duo_color:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  petg: "border-teal-200 bg-teal-100 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  abs: "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  tpu: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
};
