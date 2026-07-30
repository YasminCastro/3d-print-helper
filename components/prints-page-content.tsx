"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintCard } from "@/components/print-card";
import { categoryDotColorClass } from "@/lib/category-colors";
import type { PrintCategory, PrintWithDetails } from "@/lib/types/print";

const ALL_CATEGORIES_VALUE = "__all__";
const ALL_DURATIONS_VALUE = "__all__";

const durationRanges = [
  { value: "ate_1h", label: "Até 1h", min: 0, max: 60 },
  { value: "1h_3h", label: "1h - 3h", min: 61, max: 180 },
  { value: "3h_6h", label: "3h - 6h", min: 181, max: 360 },
  { value: "6h_mais", label: "6h+", min: 361, max: Infinity },
];

export function PrintsPageContent({
  prints,
  categoryOptions,
}: {
  prints: PrintWithDetails[];
  categoryOptions: PrintCategory[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [durationFilter, setDurationFilter] = useState(ALL_DURATIONS_VALUE);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const durationRange = durationRanges.find((range) => range.value === durationFilter);

    return prints.filter((print) => {
      if (query && !print.name.toLowerCase().includes(query)) return false;
      if (
        categoryFilter !== ALL_CATEGORIES_VALUE &&
        String(print.category_id ?? "") !== categoryFilter
      )
        return false;
      if (durationRange) {
        if (print.duration_minutes == null) return false;
        if (
          print.duration_minutes < durationRange.min ||
          print.duration_minutes > durationRange.max
        )
          return false;
      }
      return true;
    });
  }, [prints, search, categoryFilter, durationFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          items={[
            { value: ALL_CATEGORIES_VALUE, label: "Todas as categorias" },
            ...categoryOptions.map((category) => ({
              value: String(category.id),
              label: category.name,
            })),
          ]}
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value ?? ALL_CATEGORIES_VALUE)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>Todas as categorias</SelectItem>
            {categoryOptions.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                <span className="flex items-center gap-2">
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${categoryDotColorClass(category.name)}`}
                  />
                  {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={[
            { value: ALL_DURATIONS_VALUE, label: "Todos os tempos" },
            ...durationRanges.map((range) => ({ value: range.value, label: range.label })),
          ]}
          value={durationFilter}
          onValueChange={(value) => setDurationFilter(value ?? ALL_DURATIONS_VALUE)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tempo de impressão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_DURATIONS_VALUE}>Todos os tempos</SelectItem>
            {durationRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma impressão encontrada.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((print) => (
            <PrintCard key={print.id} print={print} />
          ))}
        </div>
      )}
    </div>
  );
}
