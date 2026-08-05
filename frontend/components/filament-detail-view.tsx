"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  CheckCircle2,
  Layers,
  LinkIcon,
  PaletteIcon,
  PencilIcon,
  StarIcon,
  ThermometerIcon,
  Trash2Icon,
  WalletIcon,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteFilamentAction, updateFilamentAction } from "@/lib/actions/filaments";
import { filamentFormSchema, type FilamentFormInput } from "@/lib/schemas/filament";
import type { FilamentWithBrand } from "@/lib/types/filament";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import type { availabilityOptions } from "@/lib/schemas/filament";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { FilamentFormFields, availabilityLabels } from "@/components/filament-form-fields";
import { filamentTypeColors, filamentTypeLabels } from "@/components/brand-form-fields";
import { StarRatingDisplay } from "@/components/star-rating-display";
import { PrinterStatCard, type StatColor } from "@/components/printer-stat-card";
import { filamentBannerStyle, filamentIconStyle } from "@/lib/filament-accent";

const availabilityIcons: Record<(typeof availabilityOptions)[number], typeof CheckCircle2> = {
  disponivel: CheckCircle2,
  indisponivel: XCircle,
  quase_acabando: AlertTriangle,
};

const availabilityStatColors: Record<(typeof availabilityOptions)[number], StatColor> = {
  disponivel: "green",
  indisponivel: "red",
  quase_acabando: "yellow",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

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
    rating: (filament.rating as FilamentFormInput["rating"]) ?? undefined,
    color: filament.color ?? "",
    color2: filament.color2 ?? "",
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

export function FilamentDetailView({
  filament,
  brandOptions,
}: {
  filament: FilamentWithBrand;
  brandOptions: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilamentFormInput>({
    resolver: zodResolver(filamentFormSchema),
    defaultValues: toFormValues(filament),
  });

  function onSubmit(values: FilamentFormInput) {
    startTransition(async () => {
      await updateFilamentAction(filament.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteFilamentAction(filament.id);
      router.push("/filaments");
    });
  }

  const material = filament.material as (typeof filamentTypeOptions)[number] | null;
  const availability = filament.availability as (typeof availabilityOptions)[number] | null;
  const filamentColors = [filament.color, filament.color2];
  const bannerStyle = filamentBannerStyle(filamentColors);
  const iconStyle = filamentIconStyle(filamentColors);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/filaments"
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
              <h1 className="text-xl font-semibold">Editar filamento</h1>
              <p className="text-sm text-muted-foreground">{filament.name}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FilamentFormFields form={form} brandOptions={brandOptions} />
                <div className="mt-4 flex justify-end gap-2">
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
              !bannerStyle && "bg-linear-to-br from-primary/15 via-primary/5 to-transparent"
            )}
            style={bannerStyle}
          >
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                !iconStyle && "bg-primary/15 text-primary"
              )}
              style={iconStyle}
            >
              <Layers className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{filament.name}</h1>
              {material && (
                <Badge variant="outline" className={`mt-1 ${filamentTypeColors[material] ?? ""}`}>
                  {filamentTypeLabels[material] ?? material}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PrinterStatCard
              icon={StarIcon}
              label="Nota"
              color="chart-1"
              value={
                filament.rating != null ? (
                  <StarRatingDisplay rating={filament.rating} />
                ) : (
                  "—"
                )
              }
            />
            <PrinterStatCard
              icon={availability ? availabilityIcons[availability] : CheckCircle2}
              label="Disponibilidade"
              color={availability ? availabilityStatColors[availability] : "chart-2"}
              value={availability ? availabilityLabels[availability] : "—"}
            />
            <PrinterStatCard
              icon={Building2Icon}
              label="Marca"
              color="chart-2"
              value={filament.brand_name ?? "—"}
            />
            <PrinterStatCard
              icon={WalletIcon}
              label="Preço pago"
              color="chart-4"
              value={formatPriceRange(filament)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PrinterStatCard
              icon={CalendarIcon}
              label="Última compra"
              color="chart-3"
              value={formatDate(filament.last_purchase_date)}
            />
            <PrinterStatCard
              icon={PaletteIcon}
              label="Nome de venda"
              color="chart-1"
              value={filament.sale_name ?? "—"}
            />
            {filament.color && (
              <PrinterStatCard
                icon={PaletteIcon}
                label={filament.color2 ? "Cores" : "Cor"}
                color="chart-1"
                value={
                  <span className="flex items-center gap-2">
                    <span
                      className="size-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: filament.color }}
                    />
                    {filament.color}
                    {filament.color2 && (
                      <>
                        <span
                          className="size-4 shrink-0 rounded-full border"
                          style={{ backgroundColor: filament.color2 }}
                        />
                        {filament.color2}
                      </>
                    )}
                  </span>
                }
              />
            )}
          </div>

          <PrinterStatCard
            icon={LinkIcon}
            label="Link de compra"
            color="chart-2"
            className="w-full"
            value={
              filament.purchase_link ? (
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
              )
            }
          />

          <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                <ThermometerIcon className="size-3.5" />
              </span>
              Recomendações do fabricante
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PrinterStatCard
                icon={ThermometerIcon}
                label="Temp. do bico"
                color="chart-3"
                value={formatTempRange(filament.nozzle_temp_min, filament.nozzle_temp_max)}
              />
              <PrinterStatCard
                icon={ThermometerIcon}
                label="Temp. da mesa"
                color="chart-5"
                value={formatTempRange(filament.bed_temp_min, filament.bed_temp_max)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
