"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BoxIcon,
  CheckCircle2Icon,
  ClockIcon,
  CoinsIcon,
  ImageIcon,
  Layers,
  LinkIcon,
  NotebookTextIcon,
  PencilIcon,
  Printer as PrinterIcon,
  ReceiptIcon,
  Scale,
  ShoppingBagIcon,
  TagIcon,
  ThumbsUpIcon,
  Trash2Icon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";

import { deletePrintQueueItemAction, markPrintQueueItemAsPrintedAction, updatePrintQueueItemAction } from "@/lib/actions/print-queue";
import {
  markPrintQueueItemAsPrintedFormSchema,
  printQueueFormSchema,
  type MarkPrintQueueItemAsPrintedFormInput,
  type PrintQueueFormInput,
} from "@/lib/schemas/print-queue";
import { printResultOptions } from "@/lib/schemas/print";
import type { PrintCategory, PrintQueueItemWithDetails } from "@/lib/types/print-queue";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FieldIcon } from "@/components/field-icon";
import { DatePickerField, toISODate } from "@/components/date-picker-field";
import { PrintPhotoPicker } from "@/components/print-photo-picker";
import {
  PrintQueueFormFields,
} from "@/components/print-queue-form-fields";
import { printResultDotColors, printResultLabels } from "@/components/print-form-fields";
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
import { PrinterStatCard } from "@/components/printer-stat-card";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toFormValues(queueItem: PrintQueueItemWithDetails): PrintQueueFormInput {
  return {
    name: queueItem.name,
    durationHours:
      queueItem.duration_minutes != null ? Math.floor(queueItem.duration_minutes / 60) : undefined,
    durationMinutes: queueItem.duration_minutes != null ? queueItem.duration_minutes % 60 : undefined,
    categoryId: queueItem.category_id != null ? String(queueItem.category_id) : "",
    newCategoryName: "",
    printerId: queueItem.printer_id != null ? String(queueItem.printer_id) : "",
    filaments: queueItem.filaments.map((filament) => ({
      filamentId: filament.filament_id != null ? String(filament.filament_id) : "",
      grams: filament.grams ?? undefined,
    })),
    extraItems: queueItem.extraItems.map((extraItem) => ({
      extraItemId: extraItem.extra_item_id != null ? String(extraItem.extra_item_id) : "",
      quantity: extraItem.quantity ?? undefined,
    })),
    printLink: queueItem.print_link ?? "",
    notes: queueItem.notes ?? "",
    profitPercent: queueItem.profit_percent ?? 100,
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

export function PrintQueueDetailView({
  queueItem,
  categoryOptions,
  filamentOptions,
  printerOptions,
  extraItemOptions,
  materialMaxPrices,
}: {
  queueItem: PrintQueueItemWithDetails;
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  extraItemOptions: ExtraItem[];
  materialMaxPrices: Record<string, number>;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMarkingPrinted, startMarkingPrintedTransition] = useTransition();
  const [markPrintedOpen, setMarkPrintedOpen] = useState(false);
  const [markPrintedPhotoFile, setMarkPrintedPhotoFile] = useState<File | null>(null);

  const form = useForm<PrintQueueFormInput>({
    resolver: zodResolver(printQueueFormSchema),
    defaultValues: toFormValues(queueItem),
  });

  const markPrintedDefaultValues: MarkPrintQueueItemAsPrintedFormInput = {
    printDate: toISODate(new Date()),
    result: undefined,
    saleValueActual: undefined,
  };

  const markPrintedForm = useForm<MarkPrintQueueItemAsPrintedFormInput>({
    resolver: zodResolver(markPrintQueueItemAsPrintedFormSchema),
    defaultValues: markPrintedDefaultValues,
  });

  function onSubmit(values: PrintQueueFormInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.durationHours !== undefined)
        formData.append("durationHours", String(values.durationHours));
      if (values.durationMinutes !== undefined)
        formData.append("durationMinutes", String(values.durationMinutes));
      if (values.categoryId) formData.append("categoryId", values.categoryId);
      if (values.newCategoryName) formData.append("newCategoryName", values.newCategoryName);
      if (values.printerId) formData.append("printerId", values.printerId);
      formData.append("filaments", JSON.stringify(values.filaments ?? []));
      formData.append("extraItems", JSON.stringify(values.extraItems ?? []));
      if (values.printLink) formData.append("printLink", values.printLink);
      if (values.notes) formData.append("notes", values.notes);
      if (values.profitPercent !== undefined)
        formData.append("profitPercent", String(values.profitPercent));

      try {
        await updatePrintQueueItemAction(queueItem.id, formData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível salvar o item da fila"));
        return;
      }
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      try {
        await deletePrintQueueItemAction(queueItem.id);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível excluir o item da fila"));
        return;
      }
      router.push("/print-queue");
    });
  }

  function onMarkPrinted(values: MarkPrintQueueItemAsPrintedFormInput) {
    startMarkingPrintedTransition(async () => {
      const formData = new FormData();
      if (values.printDate) formData.append("printDate", values.printDate);
      if (values.result) formData.append("result", values.result);
      if (values.saleValueActual !== undefined)
        formData.append("saleValueActual", String(values.saleValueActual));
      if (markPrintedPhotoFile) formData.append("photo", markPrintedPhotoFile);

      try {
        const { printId } = await markPrintQueueItemAsPrintedAction(queueItem.id, formData);
        router.push(`/prints/${printId}`);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível marcar o item como impresso"));
      }
    });
  }

  const filamentColors = queueItem.filaments.flatMap((f) => [f.filament_color, f.filament_color2]);
  const bannerStyle = filamentBannerStyle(filamentColors);
  const iconStyle = filamentIconStyle(
    queueItem.filaments.map((f) => colorSwatch(f.filament_color, f.filament_color2))
  );

  const totalGramsUsed = queueItem.filaments.reduce(
    (sum, filament) => sum + (filament.grams ?? 0),
    0
  );

  const filamentCostTotal = totalFilamentCost(
    queueItem.filaments.map((filament) => ({
      grams: filament.grams,
      pricePerKg: filamentPricePerKg({
        min_price_paid: filament.filament_min_price_paid,
        max_price_paid: filament.filament_max_price_paid,
      }),
    }))
  );

  const extraItemsCostTotal = totalExtraItemsCost(
    queueItem.extraItems.map((extraItem) => ({
      quantity: extraItem.quantity,
      cost: extraItem.extra_item_cost,
    }))
  );

  const printCostTotal = printCost({
    filamentCostTotal,
    durationMinutes: queueItem.duration_minutes,
    powerConsumptionW: queueItem.printer_power_consumption_w,
    energyCostPerKwh: queueItem.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: queueItem.printer_maintenance_cost_per_hour,
    extraMaterialsCost: extraItemsCostTotal,
  });

  const effectiveProfitPercent = queueItem.profit_percent ?? 100;

  const saleValueTotal = saleValue({
    filamentCostTotal,
    durationMinutes: queueItem.duration_minutes,
    powerConsumptionW: queueItem.printer_power_consumption_w,
    energyCostPerKwh: queueItem.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: queueItem.printer_maintenance_cost_per_hour,
    profitPercent: effectiveProfitPercent,
    extraMaterialsCost: extraItemsCostTotal,
  });

  const worstCaseFilamentCostTotal = totalFilamentCost(
    queueItem.filaments.map((filament) => ({
      grams: filament.grams,
      pricePerKg: mostExpensivePricePerKgOfType(
        filament.filament_material,
        materialMaxPrices,
        filamentPricePerKg({
          min_price_paid: filament.filament_min_price_paid,
          max_price_paid: filament.filament_max_price_paid,
        })
      ),
    }))
  );

  const saleValueWorstCase = saleValue({
    filamentCostTotal: worstCaseFilamentCostTotal,
    durationMinutes: queueItem.duration_minutes,
    powerConsumptionW: queueItem.printer_power_consumption_w,
    energyCostPerKwh: queueItem.printer_energy_cost_per_kwh,
    maintenanceCostPerHour: queueItem.printer_maintenance_cost_per_hour,
    profitPercent: effectiveProfitPercent,
    extraMaterialsCost: extraItemsCostTotal,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/print-queue"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </Link>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
                <Trash2Icon />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir item da fila?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O item será removido permanentemente da fila.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" disabled={isPending} onClick={onDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)}>
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
              <h1 className="text-xl font-semibold">Editar item da fila</h1>
              <p className="text-sm text-muted-foreground">{queueItem.name}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <PrintQueueFormFields
                  form={form}
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
                      form.reset(toFormValues(queueItem));
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
        <div className="flex flex-col gap-4 pb-4">
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
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold">{queueItem.name}</h1>
              <p className="text-sm text-muted-foreground">Na fila de impressão</p>
            </div>
            <Dialog
              open={markPrintedOpen}
              onOpenChange={(nextOpen) => {
                setMarkPrintedOpen(nextOpen);
                if (!nextOpen) {
                  markPrintedForm.reset(markPrintedDefaultValues);
                  setMarkPrintedPhotoFile(null);
                }
              }}
            >
              <DialogTrigger render={<Button type="button" />}>
                {isMarkingPrinted && <Spinner />}
                <CheckCircle2Icon />
                Marcar como impresso
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Marcar como impresso</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  O item sairá da fila e uma nova impressão será criada com estes dados. Esta ação
                  não pode ser desfeita.
                </p>
                <form onSubmit={markPrintedForm.handleSubmit(onMarkPrinted)}>
                  <FieldGroup>
                    <Field data-invalid={!!markPrintedForm.formState.errors.result}>
                      <FieldLabel htmlFor="mark-printed-result">
                        <FieldIcon icon={ThumbsUpIcon} color="chart-3" />
                        Resultado
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          items={printResultOptions.map((option) => ({
                            value: option,
                            label: printResultLabels[option],
                          }))}
                          value={markPrintedForm.watch("result") ?? ""}
                          onValueChange={(value) =>
                            markPrintedForm.setValue(
                              "result",
                              value as MarkPrintQueueItemAsPrintedFormInput["result"]
                            )
                          }
                        >
                          <SelectTrigger id="mark-printed-result" className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {printResultOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`size-2.5 shrink-0 rounded-full ${printResultDotColors[option]}`}
                                  />
                                  {printResultLabels[option]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError errors={[markPrintedForm.formState.errors.result]} />
                      </FieldContent>
                    </Field>

                    <DatePickerField
                      id="mark-printed-date"
                      label="Data da impressão"
                      value={markPrintedForm.watch("printDate") ?? ""}
                      onChange={(value) => markPrintedForm.setValue("printDate", value)}
                      errors={[markPrintedForm.formState.errors.printDate]}
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            markPrintedForm.setValue("printDate", toISODate(new Date()))
                          }
                        >
                          Hoje
                        </Button>
                      }
                    />

                    <Field data-invalid={!!markPrintedForm.formState.errors.saleValueActual}>
                      <FieldLabel htmlFor="mark-printed-sale-value-actual">
                        <FieldIcon icon={CoinsIcon} color="chart-4" />
                        Preço real de venda
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="mark-printed-sale-value-actual"
                          type="number"
                          step="any"
                          placeholder="Ex: 45.00"
                          {...markPrintedForm.register("saleValueActual", {
                            valueAsNumber: true,
                          })}
                        />
                        <FieldError errors={[markPrintedForm.formState.errors.saleValueActual]} />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>
                        <FieldIcon icon={ImageIcon} color="chart-5" />
                        Foto
                      </FieldLabel>
                      <FieldContent>
                        <PrintPhotoPicker
                          file={markPrintedPhotoFile}
                          onFileChange={setMarkPrintedPhotoFile}
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isMarkingPrinted}>
                      {isMarkingPrinted && <Spinner />}
                      {isMarkingPrinted ? "Marcando..." : "Marcar como impresso"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-foreground uppercase">
              Cálculos de valores
            </h2>
            <div className="grid grid-cols-2 gap-3">
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
                value={formatDuration(queueItem.duration_minutes) ?? "—"}
              />
              {queueItem.filaments.length > 0 && (
                <PrinterStatCard
                  icon={Scale}
                  label="Total de filamento usado"
                  color="teal"
                  value={`${totalGramsUsed} g`}
                />
              )}
              <PrinterStatCard
                icon={TagIcon}
                label="Categoria"
                color="purple"
                value={
                  queueItem.category_name ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent",
                        categoryColorClass(queueItem.category_name)
                      )}
                    >
                      {queueItem.category_name}
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
                value={queueItem.printer_name ?? "—"}
              />
              <PrinterStatCard
                icon={LinkIcon}
                label="Link"
                color="indigo"
                value={
                  queueItem.print_link ? (
                    <a
                      href={queueItem.print_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      {formatLinkLabel(queueItem.print_link)}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </div>

          {queueItem.filaments.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-1/15 text-chart-1">
                  <Layers className="size-3.5" />
                </span>
                Filamentos
              </div>
              <ul className="flex flex-col gap-1.5">
                {queueItem.filaments.map((filament) => (
                  <li key={filament.position} className="flex items-center gap-2 text-sm">
                    {filament.filament_color && (
                      <span
                        className="size-3.5 shrink-0 rounded-full border"
                        style={{ backgroundColor: filament.filament_color }}
                      />
                    )}
                    {filament.filament_name ?? "—"}
                    {filament.grams != null && (
                      <span className="text-muted-foreground">({filament.grams} g)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {queueItem.extraItems.length > 0 && (
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
                {queueItem.extraItems.map((extraItem) => (
                  <li key={extraItem.position} className="flex items-center gap-2 text-sm">
                    {extraItem.extra_item_name ?? "—"}
                    {extraItem.quantity != null && (
                      <span className="text-muted-foreground">({extraItem.quantity}x)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {queueItem.notes && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                  <NotebookTextIcon className="size-3.5" />
                </span>
                Notas
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{queueItem.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
