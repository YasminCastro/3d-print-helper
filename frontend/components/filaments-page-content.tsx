"use client";

import { useMemo, useState } from "react";
import { FilterIcon, SearchIcon, StarIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FilamentCard } from "@/components/filament-card";
import { filamentTypeLabels } from "@/components/brand-form-fields";
import { availabilityLabels } from "@/components/filament-form-fields";
import { filamentTypeOptions } from "@/lib/schemas/brand";
import { availabilityOptions } from "@/lib/schemas/filament";
import type { FilamentWithBrand } from "@/lib/types/filament";

function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function filamentAveragePrice(filament: FilamentWithBrand) {
  const { min_price_paid, max_price_paid } = filament;
  if (min_price_paid == null && max_price_paid == null) return null;
  if (min_price_paid != null && max_price_paid != null) {
    return (min_price_paid + max_price_paid) / 2;
  }
  return min_price_paid ?? max_price_paid;
}

export function FilamentsPageContent({
  filaments,
}: {
  filaments: FilamentWithBrand[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [colorFilter, setColorFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [availabilityFilter, setAvailabilityFilter] = useState<Set<string>>(new Set());
  const [ratingFilter, setRatingFilter] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const filament of filaments) {
      if (filament.brand_name) set.add(filament.brand_name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filaments]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    for (const filament of filaments) {
      if (filament.color) set.add(filament.color);
    }
    return Array.from(set);
  }, [filaments]);

  const filtered = useMemo(() => {
    const min = priceMin.trim() ? Number(priceMin) : null;
    const max = priceMax.trim() ? Number(priceMax) : null;
    const query = search.trim().toLowerCase();

    return filaments.filter((filament) => {
      if (query && !filament.name.toLowerCase().includes(query)) return false;

      if (brandFilter.size > 0 && (!filament.brand_name || !brandFilter.has(filament.brand_name))) {
        return false;
      }

      if (colorFilter.size > 0 && (!filament.color || !colorFilter.has(filament.color))) {
        return false;
      }

      if (typeFilter.size > 0 && (!filament.material || !typeFilter.has(filament.material))) {
        return false;
      }

      if (
        availabilityFilter.size > 0 &&
        (!filament.availability || !availabilityFilter.has(filament.availability))
      ) {
        return false;
      }

      if (
        ratingFilter.size > 0 &&
        (filament.rating == null || !ratingFilter.has(String(filament.rating)))
      ) {
        return false;
      }

      if (min != null || max != null) {
        const avgPrice = filamentAveragePrice(filament);
        if (avgPrice == null) return false;
        if (min != null && avgPrice < min) return false;
        if (max != null && avgPrice > max) return false;
      }

      return true;
    });
  }, [
    filaments,
    search,
    brandFilter,
    colorFilter,
    typeFilter,
    availabilityFilter,
    ratingFilter,
    priceMin,
    priceMax,
  ]);

  const activeFilterCount =
    brandFilter.size +
    colorFilter.size +
    typeFilter.size +
    availabilityFilter.size +
    ratingFilter.size +
    (priceMin.trim() ? 1 : 0) +
    (priceMax.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar filamento por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="button" variant="outline" onClick={() => setFiltersOpen((open) => !open)}>
          <FilterIcon />
          Filtros
          {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
        </Button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {availableBrands.length > 0 && (
              <div>
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Marca
                </span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={brandFilter.has(brand)}
                        onCheckedChange={() => setBrandFilter((prev) => toggleInSet(prev, brand))}
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Preço pago (R$)
              </span>
              <div className="mt-2 flex gap-2">
                <Input
                  type="number"
                  step="any"
                  placeholder="Mín"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                />
                <Input
                  type="number"
                  step="any"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tipo de material
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filamentTypeOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={typeFilter.has(option)}
                    onCheckedChange={() => setTypeFilter((prev) => toggleInSet(prev, option))}
                  />
                  {filamentTypeLabels[option]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Disponibilidade
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {availabilityOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={availabilityFilter.has(option)}
                    onCheckedChange={() =>
                      setAvailabilityFilter((prev) => toggleInSet(prev, option))
                    }
                  />
                  {availabilityLabels[option]}
                </label>
              ))}
            </div>
          </div>

          {availableColors.length > 0 && (
            <div>
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Cor
              </span>
              <div className="mt-2 flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <label key={color} className="flex items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={colorFilter.has(color)}
                      onCheckedChange={() => setColorFilter((prev) => toggleInSet(prev, color))}
                    />
                    <span
                      className="size-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Avaliação
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <label key={star} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={ratingFilter.has(String(star))}
                    onCheckedChange={() =>
                      setRatingFilter((prev) => toggleInSet(prev, String(star)))
                    }
                  />
                  <span className="flex items-center gap-0.5">
                    {star}
                    <StarIcon className="size-3.5 fill-yellow-400 text-yellow-400" />
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhum filamento encontrado com os filtros selecionados.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((filament) => (
            <FilamentCard key={filament.id} filament={filament} />
          ))}
        </div>
      )}
    </div>
  );
}
