"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createPrintQueueItemAction } from "@/lib/actions/print-queue";
import { printQueueFormSchema, type PrintQueueFormInput } from "@/lib/schemas/print-queue";
import type { PrintCategory } from "@/lib/types/print-queue";
import { getErrorMessage } from "@/lib/utils";
import type { FilamentOption } from "@/lib/types/filament";
import type { ExtraItem } from "@/lib/types/extra-item";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrintQueueFormFields } from "@/components/print-queue-form-fields";

function buildDefaultValues(
  lastPrinterId?: number | null,
  lastProfitPercent?: number | null
): PrintQueueFormInput {
  return {
    name: "",
    durationHours: undefined,
    durationMinutes: undefined,
    categoryId: "",
    newCategoryName: "",
    printerId: lastPrinterId ? String(lastPrinterId) : "",
    filaments: [],
    extraItems: [],
    printLink: "",
    notes: "",
    profitPercent: lastProfitPercent ?? 100,
  };
}

export function PrintQueueFormDialog({
  categoryOptions,
  filamentOptions,
  printerOptions,
  extraItemOptions,
  lastPrinterId,
  lastProfitPercent,
  trigger,
}: {
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  extraItemOptions: ExtraItem[];
  lastPrinterId?: number | null;
  lastProfitPercent?: number | null;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const defaultValues = buildDefaultValues(lastPrinterId, lastProfitPercent);

  const form = useForm<PrintQueueFormInput>({
    resolver: zodResolver(printQueueFormSchema),
    defaultValues,
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
        await createPrintQueueItemAction(formData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível salvar o item da fila"));
        return;
      }

      form.reset(defaultValues);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) form.reset(defaultValues);
      }}
    >
      <DialogTrigger render={trigger ? <button type="button" className="contents" /> : <Button />}>
        {trigger ?? (
          <>
            <PlusIcon />
            Novo Item
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Item da Fila</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PrintQueueFormFields
            form={form}
            categoryOptions={categoryOptions}
            filamentOptions={filamentOptions}
            printerOptions={printerOptions}
            extraItemOptions={extraItemOptions}
          />
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
