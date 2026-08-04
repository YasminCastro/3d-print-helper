import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ACCENT_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
]

export function accentFor(id: number) {
  return ACCENT_CLASSES[id % ACCENT_CLASSES.length]
}

const ACCENT_GRADIENT_CLASSES = [
  "bg-linear-to-br from-chart-1/15 via-chart-1/5 to-transparent",
  "bg-linear-to-br from-chart-2/15 via-chart-2/5 to-transparent",
  "bg-linear-to-br from-chart-3/15 via-chart-3/5 to-transparent",
  "bg-linear-to-br from-chart-4/15 via-chart-4/5 to-transparent",
  "bg-linear-to-br from-chart-5/15 via-chart-5/5 to-transparent",
]

export function accentGradientFor(id: number) {
  return ACCENT_GRADIENT_CLASSES[id % ACCENT_GRADIENT_CLASSES.length]
}
