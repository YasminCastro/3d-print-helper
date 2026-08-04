"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { deleteBrandAction, updateBrandAction } from "@/lib/actions/brands";
import { brandFormSchema, type BrandFormInput } from "@/lib/schemas/brand";
import type { FilamentBrand } from "@/lib/types/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    purchased: brand.purchased,
    notes: brand.notes ?? "",
  };
}

function parseFilamentTypes(brand: FilamentBrand) {
  return [...brand.filamentTypes].sort((a, b) =>
    filamentTypeLabels[a].localeCompare(filamentTypeLabels[b])
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

export function BrandDetailsDialog({
  brand,
  costBenefit,
  priceMin,
  priceMax,
  filamentRating,
  filamentRatingCount,
  open,
  onOpenChange,
}: {
  brand: FilamentBrand;
  costBenefit: (typeof costBenefitOptions)[number] | null;
  priceMin: number | null;
  priceMax: number | null;
  filamentRating: number | null;
  filamentRatingCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: toFormValues(brand),
  });

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      form.reset(toFormValues(brand));
    }
  }, [open, brand, form]);

  function onSubmit(values: BrandFormInput) {
    startTransition(async () => {
      await updateBrandAction(brand.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteBrandAction(brand.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Marca" : brand.name}</DialogTitle>
          {!isEditing && (
            <DialogDescription>Informações cadastradas da marca.</DialogDescription>
          )}
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <BrandFormFields form={form} />
            <DialogFooter className="mt-4">
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
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Nota</dt>
              <dd>
                {filamentRating != null ? (
                  <div className="flex items-center gap-1.5">
                    <Tooltip>
                      <TooltipTrigger>
                        <StarRatingDisplay rating={Math.round(filamentRating)} />
                      </TooltipTrigger>
                      <TooltipContent>
                        Média das notas dos filamentos dessa marca
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs text-muted-foreground">
                      {filamentRating.toFixed(1)} ({filamentRatingCount}{" "}
                      {filamentRatingCount === 1 ? "filamento" : "filamentos"})
                    </span>
                  </div>
                ) : (
                  "—"
                )}
              </dd>

              <dt className="text-muted-foreground">Já comprei</dt>
              <dd>{brand.purchased ? "Sim" : "Não"}</dd>

              <dt className="text-muted-foreground">Onde compra</dt>
              <dd>{brand.whereToBuy ?? "—"}</dd>

              <dt className="text-muted-foreground">Preço médio</dt>
              <dd>
                {formatPriceRange(priceMin, priceMax)}
                {(brand.avgPriceMin == null || brand.avgPriceMax == null) &&
                  (priceMin != null || priceMax != null) && (
                    <Tooltip>
                      <TooltipTrigger className="ml-1 align-middle">
                        <InfoIcon className="size-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Baseado nos filamentos cadastrados dessa marca
                      </TooltipContent>
                    </Tooltip>
                  )}
              </dd>

              <dt className="text-muted-foreground">Custo-benefício</dt>
              <dd>
                {costBenefit ? costBenefitLabels[costBenefit] : "—"}
                <Tooltip>
                  <TooltipTrigger className="ml-1 align-middle">
                    <InfoIcon className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Calculado com base no preço médio</TooltipContent>
                </Tooltip>
              </dd>

              {parseFilamentTypes(brand).length > 0 && (
                <>
                  <dt className="text-muted-foreground">Tipos de filamento</dt>
                  <dd className="flex flex-wrap gap-1">
                    {parseFilamentTypes(brand).map((type) => (
                      <Badge key={type} variant="outline" className={filamentTypeColors[type]}>
                        {filamentTypeLabels[type]}
                      </Badge>
                    ))}
                  </dd>
                </>
              )}

              {parseBestColors(brand).length > 0 && (
                <>
                  <dt className="text-muted-foreground">Melhores cores</dt>
                  <dd className="flex flex-wrap gap-1">
                    {parseBestColors(brand).map((color) => (
                      <Badge key={color} variant="secondary">
                        {color}
                      </Badge>
                    ))}
                  </dd>
                </>
              )}

              {brand.notes && (
                <>
                  <dt className="text-muted-foreground">Notas</dt>
                  <dd className="whitespace-pre-wrap">{brand.notes}</dd>
                </>
              )}
            </dl>

            <DialogFooter className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button type="button" variant="destructive" />}
                >
                  <Trash2Icon />
                  Excluir
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
              <Button type="button" onClick={() => setIsEditing(true)}>
                <PencilIcon />
                Editar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
