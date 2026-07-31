"use client";

import { useMemo, useState } from "react";
import { FilterIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandCard } from "@/components/brand-card";
import { costBenefitLabels, filamentTypeLabels } from "@/components/brand-form-fields";
import { brandAveragePrice } from "@/lib/cost-benefit";
import { costBenefitOptions, filamentTypeOptions } from "@/lib/schemas/brand";
import type { FilamentBrand } from "@/lib/types/brand";

export type BrandListItem = {
  brand: FilamentBrand;
  costBenefit: (typeof costBenefitOptions)[number] | null;
  priceMin: number | null;
  priceMax: number | null;
  filamentRating: number | null;
  filamentRatingCount: number;
};

function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function BrandsPageContent({ items }: { items: BrandListItem[] }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [costBenefitFilter, setCostBenefitFilter] = useState<Set<string>>(new Set());
  const [filamentTypeFilter, setFilamentTypeFilter] = useState<Set<string>>(new Set());
  const [colorFilter, setColorFilter] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    for (const { brand } of items) {
      brand.bestColors.forEach((color) => set.add(color));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const min = priceMin.trim() ? Number(priceMin) : null;
    const max = priceMax.trim() ? Number(priceMax) : null;
    const query = search.trim().toLowerCase();

    return items.filter(({ brand, costBenefit, priceMin: itemPriceMin, priceMax: itemPriceMax }) => {
      if (query && !brand.name.toLowerCase().includes(query)) return false;

      if (costBenefitFilter.size > 0 && (!costBenefit || !costBenefitFilter.has(costBenefit))) {
        return false;
      }

      if (min != null || max != null) {
        const avgPrice = brandAveragePrice({ avgPriceMin: itemPriceMin, avgPriceMax: itemPriceMax });
        if (avgPrice == null) return false;
        if (min != null && avgPrice < min) return false;
        if (max != null && avgPrice > max) return false;
      }

      if (filamentTypeFilter.size > 0) {
        if (!brand.filamentTypes.some((type) => filamentTypeFilter.has(type))) return false;
      }

      if (colorFilter.size > 0) {
        if (!brand.bestColors.some((color) => colorFilter.has(color))) return false;
      }

      return true;
    });
  }, [items, search, costBenefitFilter, filamentTypeFilter, colorFilter, priceMin, priceMax]);

  const activeFilterCount =
    costBenefitFilter.size +
    filamentTypeFilter.size +
    colorFilter.size +
    (priceMin.trim() ? 1 : 0) +
    (priceMax.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar marca por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <FilterIcon />
          Filtros
          {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
        </Button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Custo-benefício
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {costBenefitOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={costBenefitFilter.has(option)}
                    onCheckedChange={() =>
                      setCostBenefitFilter((prev) => toggleInSet(prev, option))
                    }
                  />
                  {costBenefitLabels[option]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Preço médio (R$)
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
            Tipos de filamento
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filamentTypeOptions.map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={filamentTypeFilter.has(option)}
                  onCheckedChange={() =>
                    setFilamentTypeFilter((prev) => toggleInSet(prev, option))
                  }
                />
                {filamentTypeLabels[option]}
              </label>
            ))}
          </div>
        </div>

        {availableColors.length > 0 && (
          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Cores
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <label key={color} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={colorFilter.has(color)}
                    onCheckedChange={() => setColorFilter((prev) => toggleInSet(prev, color))}
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>
        )}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma marca encontrada com os filtros selecionados.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ brand, costBenefit, priceMin, priceMax, filamentRating, filamentRatingCount }) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              costBenefit={costBenefit}
              priceMin={priceMin}
              priceMax={priceMax}
              filamentRating={filamentRating}
              filamentRatingCount={filamentRatingCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
