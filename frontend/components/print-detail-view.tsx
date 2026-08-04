"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { deletePrintAction, updatePrintAction } from "@/lib/actions/prints";
import { printFormSchema, type PrintFormInput } from "@/lib/schemas/print";
import type { PrintCategory, PrintWithDetails } from "@/lib/types/print";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { categoryColorClass } from "@/lib/category-colors";
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
  printResultColors,
  printResultLabels,
  printStatusColors,
  printStatusLabels,
} from "@/components/print-form-fields";
import type {
  printResultOptions,
  printStatusOptions,
} from "@/lib/schemas/print";
import type { FilamentOption } from "@/lib/types/filament";
import {
  filamentPricePerKg,
  mostExpensivePricePerKgOfType,
  printCost,
  saleValue,
  totalFilamentCost,
} from "@/lib/print-calculations";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatterDate = new Intl.DateTimeFormat("pt-BR");

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
    status: (print.status as PrintFormInput["status"]) ?? undefined,
    result: (print.result as PrintFormInput["result"]) ?? undefined,
    categoryId: print.category_id != null ? String(print.category_id) : "",
    newCategoryName: "",
    printerId: print.printer_id != null ? String(print.printer_id) : "",
    filaments: print.filaments.map((filament) => ({
      filamentId:
        filament.filament_id != null ? String(filament.filament_id) : "",
      grams: filament.grams ?? undefined,
    })),
    printLink: print.print_link ?? "",
    profitPercent: print.profit_percent ?? 100,
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
  materialMaxPrices,
}: {
  print: PrintWithDetails;
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  materialMaxPrices: Record<string, number>;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
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
      if (values.status) formData.append("status", values.status);
      if (values.result) formData.append("result", values.result);
      if (values.categoryId) formData.append("categoryId", values.categoryId);
      if (values.newCategoryName)
        formData.append("newCategoryName", values.newCategoryName);
      if (values.printerId) formData.append("printerId", values.printerId);
      formData.append("filaments", JSON.stringify(values.filaments ?? []));
      if (values.printLink) formData.append("printLink", values.printLink);
      if (values.profitPercent !== undefined)
        formData.append("profitPercent", String(values.profitPercent));
      if (photoFile) formData.append("photo", photoFile);

      await updatePrintAction(print.id, formData);
      setIsEditing(false);
      setPhotoFile(null);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deletePrintAction(print.id);
      router.push("/prints");
    });
  }

  const photoUrl = print.photo_filename ? `/print-photos/${print.id}` : null;

  const status = print.status as (typeof printStatusOptions)[number] | null;
  const result = print.result as (typeof printResultOptions)[number] | null;

  const filamentCostTotal = totalFilamentCost(
    print.filaments.map((filament) => ({
      grams: filament.grams,
      pricePerKg: filamentPricePerKg({
        min_price_paid: filament.filament_min_price_paid,
        max_price_paid: filament.filament_max_price_paid,
      }),
    })),
  );

  const printCostTotal = printCost({
    filamentCostTotal,
    durationMinutes: print.duration_minutes,
    powerConsumptionW: print.printer_power_consumption_w,
    energyCostPerKwh: print.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: print.printer_maintenance_cost_per_hour,
  });

  const effectiveProfitPercent = print.profit_percent ?? 100;

  const saleValueTotal = saleValue({
    filamentCostTotal,
    durationMinutes: print.duration_minutes,
    powerConsumptionW: print.printer_power_consumption_w,
    energyCostPerKwh: print.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: print.printer_maintenance_cost_per_hour,
    profitPercent: effectiveProfitPercent,
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
  });

  return (
    <div className="flex h-[calc(100svh-5.5rem)] flex-col gap-4">
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

      <Separator />

      {isEditing ? (
        <Card className="overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-lg">Editar Impressão</CardTitle>
          </CardHeader>
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
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pb-4 md:pr-6 md:pb-0">
            <div>
              <h1 className="text-xl font-semibold">{print.name}</h1>
              <p className="text-sm text-muted-foreground">
                Impresso em{" "}
                {print.print_date
                  ? dateFormatterDate.format(new Date(print.print_date))
                  : "—"}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="mb-2 text-sm font-medium text-foreground uppercase">
                Cálculos de valores
              </h2>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">
                  Valor de venda ({effectiveProfitPercent}% lucro)
                </dt>
                <dd className="text-right font-medium">
                  {currencyFormatter.format(saleValueTotal)}
                </dd>

                <dt className="text-muted-foreground">
                  Valor de venda (pior cenário)
                </dt>
                <dd className="text-right font-medium">
                  {currencyFormatter.format(saleValueWorstCase)}
                </dd>

                <dt className="text-muted-foreground">Preço de custo</dt>
                <dd className="text-right font-medium">
                  {currencyFormatter.format(printCostTotal)}
                </dd>

                <dt className="text-muted-foreground">Preço do filamento</dt>
                <dd className="text-right font-medium">
                  {currencyFormatter.format(filamentCostTotal)}
                </dd>
              </dl>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-medium text-foreground uppercase">
                Informações da impressão
              </h2>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Tempo de impressão</dt>
                <dd className="text-right">
                  {formatDuration(print.duration_minutes) ?? "—"}
                </dd>

                <dt className="text-muted-foreground">Status</dt>
                <dd
                  className={cn(
                    "text-right",
                    status ? printStatusColors[status] : undefined,
                  )}
                >
                  {status ? printStatusLabels[status] : "—"}
                </dd>

                <dt className="text-muted-foreground">Resultado</dt>
                <dd
                  className={cn(
                    "text-right",
                    result ? printResultColors[result] : undefined,
                  )}
                >
                  {result ? printResultLabels[result] : "—"}
                </dd>

                <dt className="text-muted-foreground">Categoria</dt>
                <dd className="text-right">
                  {print.category_name ? (
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
                  )}
                </dd>

                <dt className="text-muted-foreground">Impressora</dt>
                <dd className="text-right">{print.printer_name ?? "—"}</dd>

                <dt className="text-muted-foreground">Filamentos</dt>
                <dd className="text-right">
                  {print.filaments.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {print.filaments.map((filament) => (
                        <li
                          key={filament.position}
                          className="flex items-center justify-end gap-2"
                        >
                          {filament.filament_name ?? "—"}
                          {filament.grams != null && (
                            <span className="text-muted-foreground">
                              ({filament.grams} g)
                            </span>
                          )}
                          {filament.filament_color && (
                            <span
                              className="size-3.5 shrink-0 rounded-full border"
                              style={{
                                backgroundColor: filament.filament_color,
                              }}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </dd>

                <dt className="text-muted-foreground">Link</dt>
                <dd className="text-right">
                  {print.print_link ? (
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
                  )}
                </dd>
              </dl>
            </div>
          </div>

          <div className="flex min-h-0 pt-4 md:pt-0 md:pl-6">
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="min-h-0 flex-1 cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt=""
                  className="size-full object-contain"
                />
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
