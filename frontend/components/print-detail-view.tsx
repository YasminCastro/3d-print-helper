"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BoxIcon,
  CheckCircle2,
  ClockIcon,
  CoinsIcon,
  HourglassIcon,
  Layers,
  LinkIcon,
  NotebookTextIcon,
  PencilIcon,
  Printer as PrinterIcon,
  ReceiptIcon,
  Scale,
  ShoppingBagIcon,
  TagIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";

import { deletePrintAction, updatePrintAction } from "@/lib/actions/prints";
import { printFormSchema, type PrintFormInput } from "@/lib/schemas/print";
import type { PrintCategory, PrintWithDetails } from "@/lib/types/print";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoadingImage } from "@/components/loading-image";
import { categoryColorClass } from "@/lib/category-colors";
import { colorSwatch, filamentBannerStyle, filamentIconStyle } from "@/lib/filament-accent";
import { cn } from "@/lib/utils";
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
  PrintFormFields,
  printResultLabels,
  printStatusColors,
  printStatusLabels,
} from "@/components/print-form-fields";
import type {
  printResultOptions,
  printStatusOptions,
} from "@/lib/schemas/print";
import type { FilamentOption } from "@/lib/types/filament";
import type { ExtraItem } from "@/lib/types/extra-item";
import {
  filamentPricePerKg,
  mostExpensivePricePerKgOfType,
  printCost,
  saleValue,
  totalExtraItemsCost,
  totalFilamentCost,
} from "@/lib/print-calculations";
import { PrinterStatCard, type StatColor } from "@/components/printer-stat-card";

const statusIcons: Record<(typeof printStatusOptions)[number], typeof CheckCircle2> = {
  fila: HourglassIcon,
  pronto: CheckCircle2,
};

const resultIcons: Record<(typeof printResultOptions)[number], typeof ThumbsUpIcon> = {
  ruim: ThumbsDownIcon,
  razoavel: ThumbsDownIcon,
  bom: ThumbsUpIcon,
  perfeito: ThumbsUpIcon,
};

const resultStatColors: Record<(typeof printResultOptions)[number], StatColor> = {
  ruim: "red",
  razoavel: "yellow",
  bom: "lime",
  perfeito: "green",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatterDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function toFormValues(print: PrintWithDetails): PrintFormInput {
  return {
    name: print.name,
    printDate: print.print_date ?? "",
    durationHours:
      print.duration_minutes != null
        ? Math.floor(print.duration_minutes / 60)
        : undefined,
    durationMinutes:
      print.duration_minutes != null ? print.duration_minutes % 60 : undefined,
    result: (print.result as PrintFormInput["result"]) ?? undefined,
    categoryId: print.category_id != null ? String(print.category_id) : "",
    newCategoryName: "",
    printerId: print.printer_id != null ? String(print.printer_id) : "",
    filaments: print.filaments.map((filament) => ({
      filamentId:
        filament.filament_id != null ? String(filament.filament_id) : "",
      grams: filament.grams ?? undefined,
    })),
    extraItems: print.extraItems.map((extraItem) => ({
      extraItemId:
        extraItem.extra_item_id != null ? String(extraItem.extra_item_id) : "",
      quantity: extraItem.quantity ?? undefined,
    })),
    printLink: print.print_link ?? "",
    notes: print.notes ?? "",
    profitPercent: print.profit_percent ?? 100,
    saleValueActual: print.sale_value_actual ?? undefined,
  };
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

function formatLinkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PrintDetailView({
  print,
  categoryOptions,
  filamentOptions,
  printerOptions,
  extraItemOptions,
  materialMaxPrices,
  startInEditMode,
}: {
  print: PrintWithDetails;
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  extraItemOptions: ExtraItem[];
  materialMaxPrices: Record<string, number>;
  startInEditMode?: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(startInEditMode ?? false);
  const [isPending, startTransition] = useTransition();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  const form = useForm<PrintFormInput>({
    resolver: zodResolver(printFormSchema),
    defaultValues: toFormValues(print),
  });

  function onSubmit(values: PrintFormInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.printDate) formData.append("printDate", values.printDate);
      if (values.durationHours !== undefined)
        formData.append("durationHours", String(values.durationHours));
      if (values.durationMinutes !== undefined)
        formData.append("durationMinutes", String(values.durationMinutes));
      if (values.result) formData.append("result", values.result);
      if (values.categoryId) formData.append("categoryId", values.categoryId);
      if (values.newCategoryName)
        formData.append("newCategoryName", values.newCategoryName);
      if (values.printerId) formData.append("printerId", values.printerId);
      formData.append("filaments", JSON.stringify(values.filaments ?? []));
      formData.append("extraItems", JSON.stringify(values.extraItems ?? []));
      if (values.printLink) formData.append("printLink", values.printLink);
      if (values.notes) formData.append("notes", values.notes);
      if (values.profitPercent !== undefined)
        formData.append("profitPercent", String(values.profitPercent));
      if (values.saleValueActual !== undefined)
        formData.append("saleValueActual", String(values.saleValueActual));
      if (photoFile) formData.append("photo", photoFile);

      try {
        await updatePrintAction(print.id, formData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível salvar a impressão"));
        return;
      }
      setIsEditing(false);
      setPhotoFile(null);
    });
  }

  function onDelete() {
    startTransition(async () => {
      try {
        await deletePrintAction(print.id);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível excluir a impressão"));
        return;
      }
      router.push("/prints");
    });
  }

  const photoUrl = print.photo_filename ? `/print-photos/${print.id}` : null;

  const filamentColors = print.filaments.flatMap((f) => [f.filament_color, f.filament_color2]);
  const bannerStyle = filamentBannerStyle(filamentColors);
  const iconStyle = filamentIconStyle(
    print.filaments.map((f) => colorSwatch(f.filament_color, f.filament_color2))
  );

  const status = print.status as (typeof printStatusOptions)[number] | null;
  const result = print.result as (typeof printResultOptions)[number] | null;

  const totalGramsUsed = print.filaments.reduce(
    (sum, filament) => sum + (filament.grams ?? 0),
    0
  );

  const filamentCostTotal = totalFilamentCost(
    print.filaments.map((filament) => ({
      grams: filament.grams,
      pricePerKg: filamentPricePerKg({
        min_price_paid: filament.filament_min_price_paid,
        max_price_paid: filament.filament_max_price_paid,
      }),
    })),
  );

  const extraItemsCostTotal = totalExtraItemsCost(
    print.extraItems.map((extraItem) => ({
      quantity: extraItem.quantity,
      cost: extraItem.extra_item_cost,
    })),
  );

  const printCostTotal = printCost({
    filamentCostTotal,
    durationMinutes: print.duration_minutes,
    powerConsumptionW: print.printer_power_consumption_w,
    energyCostPerKwh: print.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: print.printer_maintenance_cost_per_hour,
    extraMaterialsCost: extraItemsCostTotal,
  });

  const effectiveProfitPercent = print.profit_percent ?? 100;

  const saleValueTotal = saleValue({
    filamentCostTotal,
    durationMinutes: print.duration_minutes,
    powerConsumptionW: print.printer_power_consumption_w,
    energyCostPerKwh: print.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: print.printer_maintenance_cost_per_hour,
    profitPercent: effectiveProfitPercent,
    extraMaterialsCost: extraItemsCostTotal,
  });

  const worstCaseFilamentCostTotal = totalFilamentCost(
    print.filaments.map((filament) => ({
      grams: filament.grams,
      pricePerKg: mostExpensivePricePerKgOfType(
        filament.filament_material,
        materialMaxPrices,
        filamentPricePerKg({
          min_price_paid: filament.filament_min_price_paid,
          max_price_paid: filament.filament_max_price_paid,
        }),
      ),
    })),
  );

  const saleValueWorstCase = saleValue({
    filamentCostTotal: worstCaseFilamentCostTotal,
    durationMinutes: print.duration_minutes,
    powerConsumptionW: print.printer_power_consumption_w,
    energyCostPerKwh: print.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: print.printer_maintenance_cost_per_hour,
    profitPercent: effectiveProfitPercent,
    extraMaterialsCost: extraItemsCostTotal,
  });

  return (
    <div className={cn("flex flex-col gap-4", !isEditing && "h-[calc(100svh-5.5rem)]")}>
      <div className="flex items-center justify-between">
        <Link
          href="/prints"
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
                  <AlertDialogTitle>Excluir impressão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A impressão será removida
                    permanentemente.
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
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex items-center gap-4 rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 ring-1 ring-foreground/10">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <PencilIcon className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">Editar impressão</h1>
              <p className="text-sm text-muted-foreground">{print.name}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <PrintFormFields
                  form={form}
                  photoFile={photoFile}
                  onPhotoFileChange={setPhotoFile}
                  existingPhotoUrl={photoUrl}
                  categoryOptions={categoryOptions}
                  filamentOptions={filamentOptions}
                  printerOptions={printerOptions}
                  extraItemOptions={extraItemOptions}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setPhotoFile(null);
                      form.reset(toFormValues(print));
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
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pb-4 md:pb-0">
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
                <BoxIcon className="size-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-semibold">{print.name}</h1>
                  {status && (
                    <span title={printStatusLabels[status]}>
                      {(() => {
                        const StatusIcon = statusIcons[status];
                        return (
                          <StatusIcon className={cn("size-5 shrink-0", printStatusColors[status])} />
                        );
                      })()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Impresso em{" "}
                  {print.print_date
                    ? dateFormatterDate.format(new Date(print.print_date))
                    : "—"}
                </p>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-medium text-foreground uppercase">
                Cálculos de valores
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <PrinterStatCard
                  className="col-span-2"
                  icon={CoinsIcon}
                  label="Preço real de venda"
                  color="green"
                  value={
                    print.sale_value_actual != null
                      ? currencyFormatter.format(print.sale_value_actual)
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={WalletIcon}
                  label={`Venda (${effectiveProfitPercent}% lucro)`}
                  color="yellow"
                  value={currencyFormatter.format(saleValueTotal)}
                />
                <PrinterStatCard
                  icon={TrendingDownIcon}
                  label="Venda (pior cenário)"
                  color="yellow"
                  value={currencyFormatter.format(saleValueWorstCase)}
                />
                <PrinterStatCard
                  icon={ReceiptIcon}
                  label="Preço de custo"
                  color="red"
                  value={currencyFormatter.format(printCostTotal)}
                />
                <PrinterStatCard
                  icon={CoinsIcon}
                  label="Preço do filamento"
                  color="red"
                  value={currencyFormatter.format(filamentCostTotal)}
                />
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-medium text-foreground uppercase">
                Informações da impressão
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <PrinterStatCard
                  icon={ClockIcon}
                  label="Tempo de impressão"
                  color="blue"
                  value={formatDuration(print.duration_minutes) ?? "—"}
                />
                {print.filaments.length > 0 && (
                  <PrinterStatCard
                    icon={Scale}
                    label="Total de filamento usado"
                    color="teal"
                    value={`${totalGramsUsed} g`}
                  />
                )}
                <PrinterStatCard
                  icon={result ? resultIcons[result] : ThumbsUpIcon}
                  label="Resultado"
                  color={result ? resultStatColors[result] : "gray"}
                  value={result ? printResultLabels[result] : "—"}
                />
                <PrinterStatCard
                  icon={TagIcon}
                  label="Categoria"
                  color="purple"
                  value={
                    print.category_name ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent",
                          categoryColorClass(print.category_name)
                        )}
                      >
                        {print.category_name}
                      </Badge>
                    ) : (
                      "—"
                    )
                  }
                />
                <PrinterStatCard
                  icon={PrinterIcon}
                  label="Impressora"
                  color="orange"
                  value={print.printer_name ?? "—"}
                />
                <PrinterStatCard
                  icon={LinkIcon}
                  label="Link"
                  color="indigo"
                  value={
                    print.print_link ? (
                      <a
                        href={print.print_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        {formatLinkLabel(print.print_link)}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            </div>

            {print.filaments.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-1/15 text-chart-1">
                    <Layers className="size-3.5" />
                  </span>
                  Filamentos
                </div>
                <ul className="flex flex-col gap-1.5">
                  {print.filaments.map((filament) => (
                    <li
                      key={filament.position}
                      className="flex items-center gap-2 text-sm"
                    >
                      {filament.filament_color && (
                        <span
                          className="size-3.5 shrink-0 rounded-full border"
                          style={{
                            backgroundColor: filament.filament_color,
                          }}
                        />
                      )}
                      {filament.filament_name ?? "—"}
                      {filament.grams != null && (
                        <span className="text-muted-foreground">
                          ({filament.grams} g)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {print.extraItems.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-4/15 text-chart-4">
                      <ShoppingBagIcon className="size-3.5" />
                    </span>
                    Itens extras
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {currencyFormatter.format(extraItemsCostTotal)}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {print.extraItems.map((extraItem) => (
                    <li
                      key={extraItem.position}
                      className="flex items-center gap-2 text-sm"
                    >
                      {extraItem.extra_item_name ?? "—"}
                      {extraItem.quantity != null && (
                        <span className="text-muted-foreground">
                          ({extraItem.quantity}x)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {print.notes && (
              <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                    <NotebookTextIcon className="size-3.5" />
                  </span>
                  Notas
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {print.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex min-h-0 pt-4 md:pt-0">
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="min-h-0 flex-1 cursor-zoom-in"
              >
                <LoadingImage src={photoUrl} className="size-full rounded-xl" imgClassName="object-contain" />
              </button>
            )}
          </div>
        </div>
      )}

      {photoUrl && (
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
          <DialogContent className="max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] p-0 sm:max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt=""
              className="max-h-[calc(100vh-2rem)] w-full rounded-xl object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
