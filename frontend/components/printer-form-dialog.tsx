"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createPrinterAction } from "@/lib/actions/printers";
import { printerFormSchema, type PrinterFormInput } from "@/lib/schemas/printer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrinterFormFields } from "@/components/printer-form-fields";

const defaultValues: PrinterFormInput = {
  name: "",
  brand: "",
  powerConsumptionW: undefined,
  maintenanceCostPerHour: undefined,
  purchasePrice: undefined,
  lifespanHours: undefined,
};

export function PrinterFormDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PrinterFormInput>({
    resolver: zodResolver(printerFormSchema),
    defaultValues,
  });

  function onSubmit(values: PrinterFormInput) {
    startTransition(async () => {
      await createPrinterAction(values);
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) form.reset();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Nova Impressora
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Impressora</DialogTitle>
          <DialogDescription>
            Cadastre uma nova impressora. Você poderá configurar mais detalhes depois.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PrinterFormFields form={form} />
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
