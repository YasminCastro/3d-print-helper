"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CableIcon,
  ClockIcon,
  PencilIcon,
  PlugZapIcon,
  Printer as PrinterIcon,
  TagIcon,
  Trash2Icon,
  WalletIcon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  deletePrinterAction,
  updatePrinterAction,
} from "@/lib/actions/printers";
import { printerFormSchema, type PrinterFormInput } from "@/lib/schemas/printer";
import type { Printer } from "@/lib/types/printer";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { PrinterFormFields, extrusionTypeLabels } from "@/components/printer-form-fields";
import { PrinterStatCard } from "@/components/printer-stat-card";
import { accentFor, accentGradientFor, cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toFormValues(printer: Printer): PrinterFormInput {
  return {
    name: printer.name,
    brand: printer.brand ?? "",
    powerConsumptionW: printer.powerConsumptionW ?? undefined,
    maintenanceCostPerHour: printer.maintenanceCostPerHour ?? undefined,
    purchasePrice: printer.purchasePrice ?? undefined,
    lifespanHours: printer.lifespanHours ?? undefined,
    energyCostPerKwh: printer.energyCostPerKwh ?? undefined,
    color: printer.color ?? "",
    extrusionType: printer.extrusionType ?? undefined,
  };
}

export function PrinterDetailView({ printer }: { printer: Printer }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PrinterFormInput>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: toFormValues(printer),
  });

  function onSubmit(values: PrinterFormInput) {
    startTransition(async () => {
      try {
        await updatePrinterAction(printer.id, values);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível atualizar a impressora"));
        return;
      }
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      try {
        await deletePrinterAction(printer.id);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível excluir a impressora"));
        return;
      }
      router.push("/printers");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/printers"
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
                  <AlertDialogTitle>Excluir impressora?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A impressora &quot;{printer.name}
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
              <h1 className="text-xl font-semibold">Editar impressora</h1>
              <p className="text-sm text-muted-foreground">{printer.name}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <PrinterFormFields form={form} />
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset(toFormValues(printer));
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
              !printer.color && accentGradientFor(printer.id)
            )}
            style={
              printer.color
                ? {
                    background: `linear-gradient(to bottom right, ${printer.color}26, ${printer.color}0d, transparent)`,
                  }
                : undefined
            }
          >
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${printer.color ? "" : accentFor(printer.id)}`}
              style={
                printer.color
                  ? { backgroundColor: `${printer.color}26`, color: printer.color }
                  : undefined
              }
            >
              <PrinterIcon className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{printer.name}</h1>
              {printer.brand && (
                <Badge
                  variant="outline"
                  className={`mt-1 ${printer.color ? "" : accentFor(printer.id)}`}
                  style={
                    printer.color
                      ? {
                          backgroundColor: `${printer.color}1a`,
                          color: printer.color,
                          borderColor: `${printer.color}40`,
                        }
                      : undefined
                  }
                >
                  <TagIcon className="size-3" />
                  {printer.brand}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <PrinterStatCard
              icon={ZapIcon}
              label="Consumo"
              value={
                printer.powerConsumptionW != null
                  ? `${printer.powerConsumptionW} W`
                  : "—"
              }
              color="chart-2"
            />
            <PrinterStatCard
              icon={ClockIcon}
              label="Vida útil"
              value={
                printer.lifespanHours != null
                  ? `${printer.lifespanHours} h`
                  : "—"
              }
              color="chart-3"
            />
            <PrinterStatCard
              icon={WalletIcon}
              label="Preço pago"
              value={
                printer.purchasePrice != null
                  ? currencyFormatter.format(printer.purchasePrice)
                  : "—"
              }
              color="chart-4"
            />
            <PrinterStatCard
              icon={PlugZapIcon}
              label="Preço do kWh"
              value={
                printer.energyCostPerKwh != null
                  ? currencyFormatter.format(printer.energyCostPerKwh)
                  : "—"
              }
              color="chart-5"
            />
            <PrinterStatCard
              icon={WrenchIcon}
              label="Manutenção"
              value={
                printer.maintenanceCostPerHour != null
                  ? `${currencyFormatter.format(printer.maintenanceCostPerHour)}/h`
                  : "—"
              }
              color="chart-1"
            />
            <PrinterStatCard
              icon={CableIcon}
              label="Extrusão"
              value={
                printer.extrusionType
                  ? extrusionTypeLabels[printer.extrusionType]
                  : "—"
              }
              color="chart-2"
            />
          </div>
        </>
      )}
    </div>
  );
}
