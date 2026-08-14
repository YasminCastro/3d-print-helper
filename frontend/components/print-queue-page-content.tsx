"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, FilterIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PrintQueueCard } from "@/components/print-queue-card";
import { categoryDotColorClass } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { printQueueSortLabels, printQueueSortOptions, type PrintQueueSortOption } from "@/lib/schemas/print-queue";
import type { PrintCategory, PrintQueueItemWithDetails } from "@/lib/types/print-queue";

const sortOptions: { value: PrintQueueSortOption; label: string }[] = printQueueSortOptions.map(
  (value) => ({ value, label: printQueueSortLabels[value] })
);

const DEFAULT_SORT: PrintQueueSortOption = "newest";
const SEARCH_DEBOUNCE_MS = 400;

type ParamOverrides = Record<string, string | string[] | null>;

function withParams(current: URLSearchParams, overrides: ParamOverrides) {
  const params = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(overrides)) {
    params.delete(key);
    if (value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  return params;
}

function toggleInArray(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const show = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...show].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const pages: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) pages.push("ellipsis");
    pages.push(page);
    previous = page;
  }
  return pages;
}

export function PrintQueuePageContent({
  queueItems,
  categoryOptions,
  printerOptions,
  pagination,
}: {
  queueItems: PrintQueueItemWithDetails[];
  categoryOptions: PrintCategory[];
  printerOptions: { id: number; name: string }[];
  pagination: { page: number; totalPages: number; total: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const sort = (searchParams.get("sort") as PrintQueueSortOption | null) ?? DEFAULT_SORT;
  const urlSearch = searchParams.get("search") ?? "";
  const categoryFilter = searchParams.getAll("categoryId");
  const printerFilter = searchParams.getAll("printerId");

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    setSearchInput(urlSearch);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const activeFilterCount = categoryFilter.length + printerFilter.length;

  function navigate(overrides: ParamOverrides) {
    const params = withParams(searchParams, { ...overrides, page: null });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ search: value.trim() || null });
    }, SEARCH_DEBOUNCE_MS);
  }

  function toggleCategory(value: string) {
    navigate({ categoryId: toggleInArray(categoryFilter, value) });
  }

  function togglePrinter(value: string) {
    navigate({ printerId: toggleInArray(printerFilter, value) });
  }

  function sortHref(value: PrintQueueSortOption) {
    const params = withParams(searchParams, { sort: value === DEFAULT_SORT ? null : value, page: null });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function pageHref(page: number) {
    const params = withParams(searchParams, { page: page > 1 ? String(page) : null });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome..."
            value={searchInput}
            onChange={(event) => handleSearchChange(event.target.value)}
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
              <Link
                key={option.value}
                href={sortHref(option.value)}
                className={buttonVariants({
                  variant: sort === option.value ? "default" : "outline",
                  size: "sm",
                  className: "rounded-full",
                })}
              >
                {option.label}
              </Link>
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
                <label key={category.id} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={categoryFilter.includes(String(category.id))}
                    onCheckedChange={() => toggleCategory(String(category.id))}
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
              Impressora
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {printerOptions.map((printer) => (
                <label key={printer.id} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={printerFilter.includes(String(printer.id))}
                    onCheckedChange={() => togglePrinter(String(printer.id))}
                  />
                  {printer.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {queueItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhum item encontrado.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {queueItems.map((queueItem) => (
            <PrintQueueCard key={queueItem.id} queueItem={queueItem} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                size="icon-sm"
                text=""
                aria-disabled={pagination.page <= 1}
                tabIndex={pagination.page <= 1 ? -1 : undefined}
                className={cn(pagination.page <= 1 && "pointer-events-none opacity-50")}
                render={<Link href={pageHref(pagination.page - 1)} />}
              />
            </PaginationItem>

            {getPageNumbers(pagination.page, pagination.totalPages).map((page, index) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    size="icon-sm"
                    isActive={page === pagination.page}
                    render={<Link href={pageHref(page)} />}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                size="icon-sm"
                text=""
                aria-disabled={pagination.page >= pagination.totalPages}
                tabIndex={pagination.page >= pagination.totalPages ? -1 : undefined}
                className={cn(
                  pagination.page >= pagination.totalPages && "pointer-events-none opacity-50"
                )}
                render={<Link href={pageHref(pagination.page + 1)} />}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
