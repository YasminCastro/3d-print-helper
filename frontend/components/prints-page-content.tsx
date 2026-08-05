"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon, FilterIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintCard } from "@/components/print-card";
import { printResultLabels, printStatusLabels } from "@/components/print-form-fields";
import { categoryDotColorClass } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { printResultOptions, printStatusOptions } from "@/lib/schemas/print";
import type { PrintCategory, PrintWithDetails } from "@/lib/types/print";

const durationRanges = [
  { value: "ate_1h", label: "Até 1h", min: 0, max: 60 },
  { value: "1h_3h", label: "1h - 3h", min: 61, max: 180 },
  { value: "3h_6h", label: "3h - 6h", min: 181, max: 360 },
  { value: "6h_mais", label: "6h+", min: 361, max: Infinity },
];

const sortOptions = [
  { value: "novidades", label: "Novidades" },
  { value: "mais_antigos", label: "Mais antigos" },
  { value: "nome", label: "Ordem alfabética (A-Z)" },
  { value: "nome_desc", label: "Ordem alfabética (Z-A)" },
  { value: "tempo_maior", label: "Maior tempo de impressão" },
  { value: "tempo_menor", label: "Menor tempo de impressão" },
  { value: "venda_maior", label: "Maior valor de venda" },
  { value: "venda_menor", label: "Menor valor de venda" },
] as const;

const DEFAULT_SORT = "novidades";

function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function PrintsPageContent({
  prints,
  categoryOptions,
}: {
  prints: PrintWithDetails[];
  categoryOptions: PrintCategory[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [durationFilter, setDurationFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [resultFilter, setResultFilter] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>(DEFAULT_SORT);

  const activeFilterCount =
    categoryFilter.size + durationFilter.size + statusFilter.size + resultFilter.size;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedRanges = durationRanges.filter((range) => durationFilter.has(range.value));

    const result = prints.filter((print) => {
      if (query && !print.name.toLowerCase().includes(query)) return false;

      if (
        categoryFilter.size > 0 &&
        (!print.category_id || !categoryFilter.has(String(print.category_id)))
      )
        return false;

      if (selectedRanges.length > 0) {
        if (print.duration_minutes == null) return false;
        const matches = selectedRanges.some(
          (range) =>
            print.duration_minutes! >= range.min && print.duration_minutes! <= range.max
        );
        if (!matches) return false;
      }

      if (statusFilter.size > 0 && (!print.status || !statusFilter.has(print.status))) {
        return false;
      }

      if (resultFilter.size > 0 && (!print.result || !resultFilter.has(print.result))) {
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
      case "tempo_maior":
        sorted.sort((a, b) => (b.duration_minutes ?? -1) - (a.duration_minutes ?? -1));
        break;
      case "tempo_menor":
        sorted.sort(
          (a, b) =>
            (a.duration_minutes ?? Infinity) - (b.duration_minutes ?? Infinity)
        );
        break;
      case "venda_maior":
        sorted.sort((a, b) => (b.sale_value ?? 0) - (a.sale_value ?? 0));
        break;
      case "venda_menor":
        sorted.sort((a, b) => (a.sale_value ?? 0) - (b.sale_value ?? 0));
        break;
      case "mais_antigos":
        sorted.sort((a, b) => {
          const dateA = a.print_date ? new Date(a.print_date).getTime() : new Date(a.created_at).getTime();
          const dateB = b.print_date ? new Date(b.print_date).getTime() : new Date(b.created_at).getTime();
          return dateA - dateB;
        });
        break;
      default:
        sorted.sort((a, b) => {
          const dateA = a.print_date ? new Date(a.print_date).getTime() : new Date(a.created_at).getTime();
          const dateB = b.print_date ? new Date(b.print_date).getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        });
    }

    return sorted;
  }, [prints, search, categoryFilter, durationFilter, statusFilter, resultFilter, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome..."
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
          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Categoria
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {categoryOptions.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <Checkbox
                    checked={categoryFilter.has(String(category.id))}
                    onCheckedChange={() =>
                      setCategoryFilter((prev) => toggleInSet(prev, String(category.id)))
                    }
                  />
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${categoryDotColorClass(category.name)}`}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tempo de impressão
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {durationRanges.map((range) => (
                <label key={range.value} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={durationFilter.has(range.value)}
                    onCheckedChange={() =>
                      setDurationFilter((prev) => toggleInSet(prev, range.value))
                    }
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {printStatusOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={statusFilter.has(option)}
                    onCheckedChange={() => setStatusFilter((prev) => toggleInSet(prev, option))}
                  />
                  {printStatusLabels[option]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Resultado
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {printResultOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={resultFilter.has(option)}
                    onCheckedChange={() => setResultFilter((prev) => toggleInSet(prev, option))}
                  />
                  {printResultLabels[option]}
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
              Nenhuma impressão encontrada.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((print) => (
            <PrintCard key={print.id} print={print} />
          ))}
        </div>
      )}
    </div>
  );
}
