"use client";

import { useMemo, useState } from "react";
import { FilterIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationCard } from "@/components/calibration-card";
import {
  calibrationStatusLabels,
  slicerLabels,
} from "@/components/calibration-form-fields";
import { calibrationStatusOptions, slicerOptions } from "@/lib/schemas/calibration";
import type { CalibrationWithFilament } from "@/lib/types/calibration";

function toggleInSet(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function CalibrationsPageContent({
  calibrations,
  filamentOptions,
}: {
  calibrations: CalibrationWithFilament[];
  filamentOptions: { id: number; name: string; color: string | null }[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [slicerFilter, setSlicerFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calibrations.filter((calibration) => {
      if (
        query &&
        !(calibration.filament_name ?? "").toLowerCase().includes(query)
      ) {
        return false;
      }

      if (slicerFilter.size > 0 && !slicerFilter.has(calibration.slicer)) {
        return false;
      }

      if (
        statusFilter.size > 0 &&
        (!calibration.status || !statusFilter.has(calibration.status))
      ) {
        return false;
      }

      return true;
    });
  }, [calibrations, search, slicerFilter, statusFilter]);

  const activeFilterCount = slicerFilter.size + statusFilter.size;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome do filamento..."
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
          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Fatiador
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {slicerOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={slicerFilter.has(option)}
                    onCheckedChange={() => setSlicerFilter((prev) => toggleInSet(prev, option))}
                  />
                  {slicerLabels[option]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {calibrationStatusOptions.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={statusFilter.has(option)}
                    onCheckedChange={() => setStatusFilter((prev) => toggleInSet(prev, option))}
                  />
                  {calibrationStatusLabels[option]}
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
              Nenhuma calibração encontrada com os filtros selecionados.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((calibration) => (
            <CalibrationCard
              key={calibration.id}
              calibration={calibration}
              filamentOptions={filamentOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
