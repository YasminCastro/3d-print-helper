"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createFilamentAction } from "@/lib/actions/filaments";
import {
  filamentFormSchema,
  type FilamentFormInput,
} from "@/lib/schemas/filament";
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
import { FilamentFormFields } from "@/components/filament-form-fields";

const defaultValues: FilamentFormInput = {
  name: "",
  availability: undefined,
  lastPurchaseDate: "",
  material: undefined,
  brandId: "",
  purchaseLink: "",
  saleName: "",
  minPricePaid: undefined,
  maxPricePaid: undefined,
  nozzleTempMin: undefined,
  nozzleTempMax: undefined,
  bedTempMin: undefined,
  bedTempMax: undefined,
  purchaseBatch: "",
  rating: undefined,
  color: "",
  color2: "",
};

export function FilamentFormDialog({
  brandOptions,
}: {
  brandOptions: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilamentFormInput>({
    resolver: zodResolver(filamentFormSchema),
    defaultValues,
  });

  function onSubmit(values: FilamentFormInput) {
    startTransition(async () => {
      await createFilamentAction(values);
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
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Novo Filamento
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Filamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FilamentFormFields form={form} brandOptions={brandOptions} />
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
