"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createExtraItemAction } from "@/lib/actions/extra-items";
import { extraItemFormSchema, type ExtraItemFormInput } from "@/lib/schemas/extra-item";
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
import { ExtraItemFormFields } from "@/components/extra-item-form-fields";

const defaultValues: ExtraItemFormInput = {
  name: "",
  cost: undefined,
};

export function ExtraItemFormDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExtraItemFormInput>({
    resolver: zodResolver(extraItemFormSchema),
    defaultValues,
  });

  function onSubmit(values: ExtraItemFormInput) {
    startTransition(async () => {
      await createExtraItemAction(values);
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
        Novo Item Extra
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Item Extra</DialogTitle>
          <DialogDescription>
            Cadastre um item extra (não impresso) que pode ser usado nas suas impressões, como
            argolas de chaveiro ou correntes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ExtraItemFormFields form={form} />
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
