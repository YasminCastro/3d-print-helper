import Link from "next/link";
import { Layers, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { availabilityColors, availabilityLabels } from "@/components/filament-form-fields";
import { filamentTypeColors, filamentTypeLabels } from "@/components/brand-form-fields";
import { filamentIconStyle } from "@/lib/filament-accent";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import type { availabilityOptions } from "@/lib/schemas/filament";
import type { FilamentWithBrand } from "@/lib/types/filament";

const availabilityIcons: Record<(typeof availabilityOptions)[number], typeof CheckCircle2> = {
  disponivel: CheckCircle2,
  indisponivel: XCircle,
  quase_acabando: AlertTriangle,
};

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

function formatPriceRange(filament: FilamentWithBrand) {
  if (filament.min_price_paid == null && filament.max_price_paid == null) return null;
  if (filament.min_price_paid != null && filament.max_price_paid != null) {
    return `${currencyFormatter.format(filament.min_price_paid)} – ${currencyFormatter.format(filament.max_price_paid)}`;
  }
  return currencyFormatter.format(filament.min_price_paid ?? filament.max_price_paid!);
}

export function FilamentCard({ filament }: { filament: FilamentWithBrand }) {
  const priceRange = formatPriceRange(filament);
  const material = filament.material as (typeof filamentTypeOptions)[number] | null;
  const availability = filament.availability as (typeof availabilityOptions)[number] | null;
  const AvailabilityIcon = availability ? availabilityIcons[availability] : null;
  const iconStyle = filamentIconStyle([filament.color, filament.color2]);

  return (
    <Link href={`/filaments/${filament.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              !iconStyle && accentFor(filament.id)
            )}
            style={iconStyle}
          >
            <Layers className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-1.5 truncate text-base">
              {filament.name}
              {AvailabilityIcon && availability && (
                <AvailabilityIcon
                  className={cn("size-4 shrink-0", availabilityColors[availability])}
                  aria-label={availabilityLabels[availability]}
                />
              )}
            </CardTitle>
            {filament.brand_name && (
              <p className="truncate text-xs text-muted-foreground">{filament.brand_name}</p>
            )}
          </div>
        </CardHeader>

        {(priceRange || material || filament.rating != null) && (
          <CardContent className="mt-auto flex flex-col gap-2">
            {filament.rating != null && <StarRatingDisplay rating={filament.rating} />}
            <div className="flex flex-wrap items-center gap-1.5">
              {priceRange && <Badge variant="secondary">{priceRange}</Badge>}
              {material && (
                <Badge variant="outline" className={filamentTypeColors[material]}>
                  {filamentTypeLabels[material] ?? material}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
