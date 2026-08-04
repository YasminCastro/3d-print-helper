import Link from "next/link";
import { Package, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/star-rating-display";
import {
  costBenefitLabels,
  filamentTypeColors,
  filamentTypeLabels,
} from "@/components/brand-form-fields";
import type { costBenefitOptions } from "@/lib/schemas/brand";
import type { FilamentBrand } from "@/lib/types/brand";

const ACCENT_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function accentFor(id: number) {
  return ACCENT_CLASSES[id % ACCENT_CLASSES.length];
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatPriceRange(priceMin: number | null, priceMax: number | null) {
  if (priceMin == null && priceMax == null) return null;
  if (priceMin != null && priceMax != null) {
    return `${currencyFormatter.format(priceMin)} – ${currencyFormatter.format(priceMax)}`;
  }
  return currencyFormatter.format(priceMin ?? priceMax!);
}

export function BrandCard({
  brand,
  costBenefit,
  priceMin,
  priceMax,
  filamentRating,
  filamentRatingCount,
}: {
  brand: FilamentBrand;
  costBenefit: (typeof costBenefitOptions)[number] | null;
  priceMin: number | null;
  priceMax: number | null;
  filamentRating: number | null;
  filamentRatingCount: number;
}) {
  const priceRange = formatPriceRange(priceMin, priceMax);
  const filamentTypes = [...brand.filamentTypes].sort((a, b) =>
    (filamentTypeLabels[a] ?? a).localeCompare(filamentTypeLabels[b] ?? b)
  );
  const bestColors = [...brand.bestColors].sort((a, b) => a.localeCompare(b));

  return (
    <Link href={`/brands/${brand.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${brand.color ? "" : accentFor(brand.id)}`}
            style={
              brand.color
                ? { backgroundColor: `${brand.color}26`, color: brand.color }
                : undefined
            }
          >
            <Package className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-1.5 truncate text-base">
              {brand.name}
              {!!brand.purchased && (
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="Já comprei" />
              )}
            </CardTitle>
          </div>
        </CardHeader>
        {(priceRange ||
          costBenefit ||
          filamentRating != null ||
          filamentTypes.length > 0 ||
          bestColors.length > 0) && (
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            {filamentRating != null && (
              <div className="flex items-center gap-1.5">
                <StarRatingDisplay rating={Math.round(filamentRating)} />
                <span className="text-xs">
                  {filamentRating.toFixed(1)} ({filamentRatingCount}{" "}
                  {filamentRatingCount === 1 ? "filamento" : "filamentos"})
                </span>
              </div>
            )}
            {(priceRange || costBenefit) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {priceRange && <Badge variant="secondary">{priceRange}</Badge>}
                {costBenefit && (
                  <Badge variant="outline">{costBenefitLabels[costBenefit]}</Badge>
                )}
              </div>
            )}
            {filamentTypes.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
                  Tipos
                </span>
                <div className="flex flex-wrap gap-1">
                  {filamentTypes.map((type) => (
                    <Badge key={type} variant="outline" className={filamentTypeColors[type]}>
                      {filamentTypeLabels[type] ?? type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {bestColors.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
                  Cores
                </span>
                <div className="flex flex-wrap gap-1">
                  {bestColors.map((color) => (
                    <Badge key={color} variant="secondary">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
