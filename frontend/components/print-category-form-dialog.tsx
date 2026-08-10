"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createPrintCategoryAction } from "@/lib/actions/print-categories";
import { printCategoryFormSchema, type PrintCategoryFormInput } from "@/lib/schemas/print-category";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrintCategoryFormFields } from "@/components/print-category-form-fields";

const defaultValues: PrintCategoryFormInput = {
  name: "",
  color: "",
};

export function PrintCategoryFormDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PrintCategoryFormInput>({
    resolver: zodResolver(printCategoryFormSchema),
    defaultValues,
  });

  function onSubmit(values: PrintCategoryFormInput) {
    startTransition(async () => {
      await createPrintCategoryAction(values);
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
        Nova Categoria
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Cadastre uma categoria para organizar suas impressões.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PrintCategoryFormFields form={form} />
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
