"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  InfoIcon,
  LayersIcon,
  NotebookTextIcon,
  Package as PackageIcon,
  PaletteIcon,
  PencilIcon,
  StarIcon,
  StoreIcon,
  Trash2Icon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteBrandAction, updateBrandAction } from "@/lib/actions/brands";
import { brandFormSchema, type BrandFormInput } from "@/lib/schemas/brand";
import type { FilamentBrand } from "@/lib/types/brand";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BrandFormFields,
  costBenefitLabels,
  filamentTypeColors,
  filamentTypeLabels,
} from "@/components/brand-form-fields";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { PrinterStatCard } from "@/components/printer-stat-card";
import type { costBenefitOptions } from "@/lib/schemas/brand";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toFormValues(brand: FilamentBrand): BrandFormInput {
  return {
    name: brand.name,
    whereToBuy: brand.whereToBuy ?? "",
    avgPriceMin: brand.avgPriceMin ?? undefined,
    avgPriceMax: brand.avgPriceMax ?? undefined,
    filamentTypes: brand.filamentTypes,
    bestColors: brand.bestColors,
    color: brand.color ?? "",
    purchased: brand.purchased,
    notes: brand.notes ?? "",
  };
}

function parseFilamentTypes(brand: FilamentBrand) {
  return [...brand.filamentTypes].sort((a, b) =>
    (filamentTypeLabels[a] ?? a).localeCompare(filamentTypeLabels[b] ?? b)
  );
}

function parseBestColors(brand: FilamentBrand) {
  return [...brand.bestColors].sort((a, b) => a.localeCompare(b));
}

function formatPriceRange(priceMin: number | null, priceMax: number | null) {
  if (priceMin == null && priceMax == null) return "—";
  if (priceMin != null && priceMax != null) {
    return `${currencyFormatter.format(priceMin)} – ${currencyFormatter.format(priceMax)}`;
  }
  return currencyFormatter.format(priceMin ?? priceMax!);
}

export function BrandDetailView({
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
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: toFormValues(brand),
  });

  function onSubmit(values: BrandFormInput) {
    startTransition(async () => {
      await updateBrandAction(brand.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteBrandAction(brand.id);
      router.push("/brands");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/brands"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </Link>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button type="button" variant="ghost" size="icon-sm" />}
              >
                <Trash2Icon />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir marca?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A marca &quot;{brand.name}
                    &quot; será removida permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isPending}
                    onClick={onDelete}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 ring-1 ring-foreground/10">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <PencilIcon className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">Editar marca</h1>
              <p className="text-sm text-muted-foreground">{brand.name}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <BrandFormFields form={form} />
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset(toFormValues(brand));
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner />}
                    {isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "flex items-center gap-4 rounded-xl p-5 ring-1 ring-foreground/10",
              !brand.color && "bg-linear-to-br from-primary/15 via-primary/5 to-transparent"
            )}
            style={
              brand.color
                ? {
                    background: `linear-gradient(to bottom right, ${brand.color}26, ${brand.color}0d, transparent)`,
                  }
                : undefined
            }
          >
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${brand.color ? "" : "bg-primary/15 text-primary"}`}
              style={
                brand.color
                  ? { backgroundColor: `${brand.color}26`, color: brand.color }
                  : undefined
              }
            >
              <PackageIcon className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{brand.name}</h1>
              {brand.purchased && (
                <Badge variant="secondary" className="mt-1">
                  <CheckCircle2Icon className="size-3" />
                  Já comprei
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <PrinterStatCard
              icon={StarIcon}
              label="Nota"
              color="chart-1"
              value={
                filamentRating != null ? (
                  <div className="flex items-center gap-1.5">
                    <Tooltip>
                      <TooltipTrigger>
                        <StarRatingDisplay rating={Math.round(filamentRating)} />
                      </TooltipTrigger>
                      <TooltipContent>
                        Média das notas dos filamentos dessa marca
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({filamentRatingCount})
                    </span>
                  </div>
                ) : (
                  "—"
                )
              }
            />
            <PrinterStatCard
              icon={WalletIcon}
              label="Preço médio"
              color="chart-4"
              value={
                <span className="flex items-center gap-1">
                  {formatPriceRange(priceMin, priceMax)}
                  {(brand.avgPriceMin == null || brand.avgPriceMax == null) &&
                    (priceMin != null || priceMax != null) && (
                      <Tooltip>
                        <TooltipTrigger className="align-middle">
                          <InfoIcon className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Baseado nos filamentos cadastrados dessa marca
                        </TooltipContent>
                      </Tooltip>
                    )}
                </span>
              }
            />
            <PrinterStatCard
              icon={TrendingUpIcon}
              label="Custo-benefício"
              color="chart-3"
              value={
                <span className="flex items-center gap-1">
                  {costBenefit ? costBenefitLabels[costBenefit] : "—"}
                  <Tooltip>
                    <TooltipTrigger className="align-middle">
                      <InfoIcon className="size-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Calculado com base no preço médio</TooltipContent>
                  </Tooltip>
                </span>
              }
            />
          </div>

          <PrinterStatCard
            icon={StoreIcon}
            label="Onde compra"
            color="chart-2"
            value={brand.whereToBuy ?? "—"}
            className="w-full"
          />

          {parseFilamentTypes(brand).length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                  <LayersIcon className="size-3.5" />
                </span>
                Tipos de filamento
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parseFilamentTypes(brand).map((type) => (
                  <Badge key={type} variant="outline" className={filamentTypeColors[type]}>
                    {filamentTypeLabels[type] ?? type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {parseBestColors(brand).length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-5/15 text-chart-5">
                  <PaletteIcon className="size-3.5" />
                </span>
                Melhores cores
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parseBestColors(brand).map((color) => (
                  <Badge key={color} variant="secondary">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {brand.notes && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-1/15 text-chart-1">
                  <NotebookTextIcon className="size-3.5" />
                </span>
                Notas
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {brand.notes}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
