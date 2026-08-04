"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createPrintAction } from "@/lib/actions/prints";
import { printFormSchema, type PrintFormInput } from "@/lib/schemas/print";
import type { PrintCategory } from "@/lib/types/print";
import type { FilamentOption } from "@/lib/types/filament";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrintFormFields } from "@/components/print-form-fields";

function buildDefaultValues(
  lastPrinterId?: number | null,
  lastProfitPercent?: number | null
): PrintFormInput {
  return {
    name: "",
    printDate: "",
    durationHours: undefined,
    durationMinutes: undefined,
    status: undefined,
    result: undefined,
    categoryId: "",
    newCategoryName: "",
    printerId: lastPrinterId ? String(lastPrinterId) : "",
    filaments: [],
    printLink: "",
    profitPercent: lastProfitPercent ?? 100,
  };
}

export function PrintFormDialog({
  categoryOptions,
  filamentOptions,
  printerOptions,
  lastPrinterId,
  lastProfitPercent,
  trigger,
}: {
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  lastPrinterId?: number | null;
  lastProfitPercent?: number | null;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const defaultValues = buildDefaultValues(lastPrinterId, lastProfitPercent);

  const form = useForm<PrintFormInput>({
    resolver: zodResolver(printFormSchema),
    defaultValues,
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

      await createPrintAction(formData);

      form.reset(defaultValues);
      setPhotoFile(null);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset(defaultValues);
          setPhotoFile(null);
        }
      }}
    >
      <DialogTrigger render={trigger ? <button type="button" className="contents" /> : <Button />}>
        {trigger ?? (
          <>
            <PlusIcon />
            Nova Impressão
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Impressão</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PrintFormFields
            form={form}
            photoFile={photoFile}
            onPhotoFileChange={setPhotoFile}
            categoryOptions={categoryOptions}
            filamentOptions={filamentOptions}
            printerOptions={printerOptions}
          />
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
