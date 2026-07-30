import { costBenefitOptions } from "@/lib/schemas/brand";
import type { FilamentBrand } from "@/lib/types/brand";

type BrandPrice = Pick<FilamentBrand, "avg_price_min" | "avg_price_max">;

export function brandAveragePrice(brand: BrandPrice) {
  const { avg_price_min, avg_price_max } = brand;
  if (avg_price_min == null && avg_price_max == null) return null;
  if (avg_price_min != null && avg_price_max != null) return (avg_price_min + avg_price_max) / 2;
  return avg_price_min ?? avg_price_max;
}

export function groupAveragePrice(brands: BrandPrice[]) {
  const prices = brands
    .map(brandAveragePrice)
    .filter((price): price is number => price != null);

  if (prices.length === 0) return null;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

export function computeCostBenefit(
  avgPrice: number | null,
  groupAverage: number | null
): (typeof costBenefitOptions)[number] | null {
  if (avgPrice == null || groupAverage == null || groupAverage <= 0) return null;

  const ratio = avgPrice / groupAverage;
  if (ratio <= 0.85) return "otimo";
  if (ratio <= 1.0) return "bom";
  if (ratio <= 1.15) return "moderado";
  return "baixo";
}
