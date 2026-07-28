"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { deleteFilamentAction, updateFilamentAction } from "@/lib/actions/filaments";
import { filamentFormSchema, type FilamentFormInput } from "@/lib/schemas/filament";
import type { FilamentWithBrand } from "@/lib/types/filament";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import type { availabilityOptions } from "@/lib/schemas/filament";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  FilamentFormFields,
  availabilityColors,
  availabilityLabels,
} from "@/components/filament-form-fields";
import { filamentTypeColors, filamentTypeLabels } from "@/components/brand-form-fields";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { Separator } from "@/components/ui/separator";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function toFormValues(filament: FilamentWithBrand): FilamentFormInput {
  return {
    name: filament.name,
    availability: (filament.availability as FilamentFormInput["availability"]) ?? undefined,
    lastPurchaseDate: filament.last_purchase_date ?? "",
    material: (filament.material as FilamentFormInput["material"]) ?? undefined,
    brandId: filament.brand_id != null ? String(filament.brand_id) : "",
    purchaseLink: filament.purchase_link ?? "",
    saleName: filament.sale_name ?? "",
    minPricePaid: filament.min_price_paid ?? undefined,
    maxPricePaid: filament.max_price_paid ?? undefined,
    nozzleTempMin: filament.nozzle_temp_min ?? undefined,
    nozzleTempMax: filament.nozzle_temp_max ?? undefined,
    bedTempMin: filament.bed_temp_min ?? undefined,
    bedTempMax: filament.bed_temp_max ?? undefined,
    purchaseBatch: filament.purchase_batch ?? "",
    rating: (filament.rating as FilamentFormInput["rating"]) ?? undefined,
    color: filament.color ?? "",
  };
}

function formatPriceRange(filament: FilamentWithBrand) {
  if (filament.min_price_paid == null && filament.max_price_paid == null) return "—";
  if (filament.min_price_paid != null && filament.max_price_paid != null) {
    return `${currencyFormatter.format(filament.min_price_paid)} – ${currencyFormatter.format(filament.max_price_paid)}`;
  }
  return currencyFormatter.format(filament.min_price_paid ?? filament.max_price_paid!);
}

function formatTempRange(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min}°C – ${max}°C`;
  return `${min ?? max}°C`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function FilamentDetailsDialog({
  filament,
  brandOptions,
  open,
  onOpenChange,
}: {
  filament: FilamentWithBrand;
  brandOptions: { id: number; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilamentFormInput>({
    resolver: zodResolver(filamentFormSchema),
    defaultValues: toFormValues(filament),
  });

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      form.reset(toFormValues(filament));
    }
  }, [open, filament, form]);

  function onSubmit(values: FilamentFormInput) {
    startTransition(async () => {
      await updateFilamentAction(filament.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteFilamentAction(filament.id);
      onOpenChange(false);
    });
  }

  const material = filament.material as (typeof filamentTypeOptions)[number] | null;
  const availability = filament.availability as (typeof availabilityOptions)[number] | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Filamento" : filament.name}</DialogTitle>
          {!isEditing && (
            <DialogDescription>Informações cadastradas do filamento.</DialogDescription>
          )}
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FilamentFormFields form={form} brandOptions={brandOptions} />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  form.reset(toFormValues(filament));
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
                {filament.rating != null ? (
                  <StarRatingDisplay rating={filament.rating} />
                ) : (
                  "—"
                )}
              </dd>

              <dt className="text-muted-foreground">Disponibilidade</dt>
              <dd className={availability ? availabilityColors[availability] : undefined}>
                {availability ? availabilityLabels[availability] : "—"}
              </dd>

              {filament.color && (
                <>
                  <dt className="text-muted-foreground">Cor</dt>
                  <dd className="flex items-center gap-2">
                    <span
                      className="size-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: filament.color }}
                    />
                    {filament.color}
                  </dd>
                </>
              )}

              {material && (
                <>
                  <dt className="text-muted-foreground">Material</dt>
                  <dd>
                    <Badge variant="outline" className={filamentTypeColors[material]}>
                      {filamentTypeLabels[material]}
                    </Badge>
                  </dd>
                </>
              )}

              <dt className="text-muted-foreground">Marca</dt>
              <dd>{filament.brand_name ?? "—"}</dd>

              <dt className="text-muted-foreground">Nome de venda</dt>
              <dd>{filament.sale_name ?? "—"}</dd>

              <dt className="text-muted-foreground">Data da última compra</dt>
              <dd>{formatDate(filament.last_purchase_date)}</dd>

              <dt className="text-muted-foreground">Link de compra</dt>
              <dd className="truncate">
                {filament.purchase_link ? (
                  <a
                    href={filament.purchase_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    Abrir link
                  </a>
                ) : (
                  "—"
                )}
              </dd>

              <dt className="text-muted-foreground">Preço pago</dt>
              <dd>{formatPriceRange(filament)}</dd>

              <div className="col-span-2 flex items-center gap-2 py-1">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  Recomendações do fabricante
                </span>
                <Separator className="flex-1" />
              </div>

              <dt className="text-muted-foreground">Temp. do bico</dt>
              <dd>{formatTempRange(filament.nozzle_temp_min, filament.nozzle_temp_max)}</dd>

              <dt className="text-muted-foreground">Temp. da mesa</dt>
              <dd>{formatTempRange(filament.bed_temp_min, filament.bed_temp_max)}</dd>

              <dt className="text-muted-foreground">Lote de compra</dt>
              <dd>{filament.purchase_batch ?? "—"}</dd>
            </dl>

            <DialogFooter className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
                  <Trash2Icon />
                  Excluir
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir filamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O filamento &quot;{filament.name}
                      &quot; será removido permanentemente.
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
