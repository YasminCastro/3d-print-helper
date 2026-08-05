"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon, FilterIcon, SearchIcon, StarIcon } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { FilamentWithBrand } from "@/lib/types/filament";

const sortOptions = [
  { value: "novidades", label: "Novidades" },
  { value: "mais_antigos", label: "Mais antigos" },
  { value: "nome", label: "Ordem alfabética (A-Z)" },
  { value: "nome_desc", label: "Ordem alfabética (Z-A)" },
  { value: "avaliacao_maior", label: "Maior avaliação" },
  { value: "avaliacao_menor", label: "Menor avaliação" },
  { value: "preco_menor", label: "Menores preços" },
  { value: "preco_maior", label: "Maiores preços" },
] as const;

const DEFAULT_SORT = "novidades";

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
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [colorFilter, setColorFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [availabilityFilter, setAvailabilityFilter] = useState<Set<string>>(new Set());
  const [ratingFilter, setRatingFilter] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>(DEFAULT_SORT);

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
    const query = search.trim().toLowerCase();

    const result = filaments.filter((filament) => {
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

      return true;
    });

    const sorted = [...result];
    switch (sort) {
      case "nome":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nome_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "avaliacao_maior":
        sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
        break;
      case "avaliacao_menor":
        sorted.sort((a, b) => (a.rating ?? Infinity) - (b.rating ?? Infinity));
        break;
      case "preco_menor":
        sorted.sort(
          (a, b) => (filamentAveragePrice(a) ?? Infinity) - (filamentAveragePrice(b) ?? Infinity)
        );
        break;
      case "preco_maior":
        sorted.sort(
          (a, b) => (filamentAveragePrice(b) ?? -1) - (filamentAveragePrice(a) ?? -1)
        );
        break;
      case "mais_antigos":
        sorted.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return sorted;
  }, [filaments, search, brandFilter, colorFilter, typeFilter, availabilityFilter, ratingFilter, sort]);

  const activeFilterCount =
    brandFilter.size + colorFilter.size + typeFilter.size + availabilityFilter.size + ratingFilter.size;

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

        <Button type="button" variant="outline" onClick={() => setSortOpen((open) => !open)}>
          Ordenar
          <ChevronDownIcon
            className={cn("size-4 transition-transform", sortOpen && "rotate-180")}
          />
        </Button>
      </div>

      {sortOpen && (
        <div className="rounded-lg border p-4">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Ordenar
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={sort === option.value ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSort(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filtersOpen && (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
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
