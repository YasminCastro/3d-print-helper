"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";

import {
  deletePrinterAction,
  updatePrinterAction,
} from "@/lib/actions/printers";
import { printerFormSchema, type PrinterFormInput } from "@/lib/schemas/printer";
import type { Printer } from "@/lib/types/printer";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { PrinterFormFields } from "@/components/printer-form-fields";

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
      await updatePrinterAction(printer.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deletePrinterAction(printer.id);
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

      <Separator />

      {isEditing ? (
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
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <h1 className="text-xl font-semibold">{printer.name}</h1>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Marca</dt>
            <dd>{printer.brand ?? "—"}</dd>

            <dt className="text-muted-foreground">Consumo</dt>
            <dd>
              {printer.powerConsumptionW != null
                ? `${printer.powerConsumptionW} W`
                : "—"}
            </dd>

            <dt className="text-muted-foreground">Vida útil</dt>
            <dd>
              {printer.lifespanHours != null
                ? `${printer.lifespanHours} h`
                : "—"}
            </dd>

            <dt className="text-muted-foreground">Preço pago</dt>
            <dd>
              {printer.purchasePrice != null
                ? currencyFormatter.format(printer.purchasePrice)
                : "—"}
            </dd>

            <dt className="text-muted-foreground">Preço do kWh</dt>
            <dd>
              {printer.energyCostPerKwh != null
                ? currencyFormatter.format(printer.energyCostPerKwh)
                : "—"}
            </dd>

            <dt className="text-muted-foreground">Manutenção</dt>
            <dd>
              {printer.maintenanceCostPerHour != null
                ? `${currencyFormatter.format(printer.maintenanceCostPerHour)}/h`
                : "—"}
            </dd>
          </dl>
        </>
      )}
    </div>
  );
}
