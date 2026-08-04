import Link from "next/link";
import { Layers, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { availabilityColors, availabilityLabels } from "@/components/filament-form-fields";
import { filamentTypeColors, filamentTypeLabels } from "@/components/brand-form-fields";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import type { availabilityOptions } from "@/lib/schemas/filament";
import type { FilamentWithBrand } from "@/lib/types/filament";

const availabilityIcons: Record<(typeof availabilityOptions)[number], typeof CheckCircle2> = {
  disponivel: CheckCircle2,
  indisponivel: XCircle,
  quase_acabando: AlertTriangle,
};

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

  return (
    <Link href={`/filaments/${filament.id}`} className="block h-full">
      <Card
        className="flex h-full flex-col cursor-pointer transition hover:ring-primary/40"
      >
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Layers
              className={cn("size-4 shrink-0", !filament.color && "text-primary")}
              style={filament.color ? { color: filament.color } : undefined}
            />
            {filament.name}
            {AvailabilityIcon && availability && (
              <AvailabilityIcon
                className={cn("size-4 shrink-0", availabilityColors[availability])}
                aria-label={availabilityLabels[availability]}
              />
            )}
          </CardTitle>
        </CardHeader>
        {(priceRange || filament.brand_name || material || filament.rating || availability) && (
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            {filament.rating != null && <StarRatingDisplay rating={filament.rating} />}
            {availability && (
              <span className={availabilityColors[availability]}>
                {availabilityLabels[availability]}
              </span>
            )}
            {filament.brand_name && <span>{filament.brand_name}</span>}
            {priceRange && <span>{priceRange}</span>}
            {material && (
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className={filamentTypeColors[material]}>
                  {filamentTypeLabels[material]}
                </Badge>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
