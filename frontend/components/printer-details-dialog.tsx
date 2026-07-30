"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";

import {
  deletePrinterAction,
  updatePrinterAction,
} from "@/lib/actions/printers";
import { printerFormSchema, type PrinterFormInput } from "@/lib/schemas/printer";
import type { Printer } from "@/lib/types/printer";
import { Button } from "@/components/ui/button";
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
import { PrinterFormFields } from "@/components/printer-form-fields";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toFormValues(printer: Printer): PrinterFormInput {
  return {
    name: printer.name,
    brand: printer.brand ?? "",
    powerConsumptionW: printer.power_consumption_w ?? undefined,
    maintenanceCostPerHour: printer.maintenance_cost_per_hour ?? undefined,
    purchasePrice: printer.purchase_price ?? undefined,
    lifespanHours: printer.lifespan_hours ?? undefined,
    energyCostPerKwh: printer.energy_cost_per_kwh ?? undefined,
  };
}

export function PrinterDetailsDialog({
  printer,
  open,
  onOpenChange,
}: {
  printer: Printer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PrinterFormInput>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: toFormValues(printer),
  });

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      form.reset(toFormValues(printer));
    }
  }, [open, printer, form]);

  function onSubmit(values: PrinterFormInput) {
    startTransition(async () => {
      await updatePrinterAction(printer.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deletePrinterAction(printer.id);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Impressora" : printer.name}</DialogTitle>
          {!isEditing && (
            <DialogDescription>Informações cadastradas da impressora.</DialogDescription>
          )}
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <PrinterFormFields form={form} />
            <DialogFooter className="mt-4">
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
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Marca</dt>
              <dd>{printer.brand ?? "—"}</dd>

              <dt className="text-muted-foreground">Consumo</dt>
              <dd>
                {printer.power_consumption_w != null
                  ? `${printer.power_consumption_w} W`
                  : "—"}
              </dd>

              <dt className="text-muted-foreground">Vida útil</dt>
              <dd>
                {printer.lifespan_hours != null
                  ? `${printer.lifespan_hours} h`
                  : "—"}
              </dd>

              <dt className="text-muted-foreground">Preço pago</dt>
              <dd>
                {printer.purchase_price != null
                  ? currencyFormatter.format(printer.purchase_price)
                  : "—"}
              </dd>

              <dt className="text-muted-foreground">Preço do kWh</dt>
              <dd>
                {printer.energy_cost_per_kwh != null
                  ? currencyFormatter.format(printer.energy_cost_per_kwh)
                  : "—"}
              </dd>

              <dt className="text-muted-foreground">Manutenção</dt>
              <dd>
                {printer.maintenance_cost_per_hour != null
                  ? `${currencyFormatter.format(printer.maintenance_cost_per_hour)}/h`
                  : "—"}
              </dd>
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
