import type { filamentTypeOptions } from "@/lib/schemas/brand";

export type FilamentBrand = {
  id: number;
  name: string;
  whereToBuy: string | null;
  avgPriceMin: number | null;
  avgPriceMax: number | null;
  filamentTypes: (typeof filamentTypeOptions)[number][];
  bestColors: string[];
  color: string | null;
  purchased: boolean;
  notes: string | null;
  createdAt: string;
};
