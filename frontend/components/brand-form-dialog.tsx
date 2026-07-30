"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createBrandAction } from "@/lib/actions/brands";
import { brandFormSchema, type BrandFormInput } from "@/lib/schemas/brand";
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
import { BrandFormFields } from "@/components/brand-form-fields";

const defaultValues: BrandFormInput = {
  name: "",
  whereToBuy: "",
  avgPriceMin: undefined,
  avgPriceMax: undefined,
  filamentTypes: [],
  bestColors: [],
  purchased: false,
  notes: "",
};

export function BrandFormDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues,
  });

  function onSubmit(values: BrandFormInput) {
    startTransition(async () => {
      await createBrandAction(values);
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
        Nova Marca
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Marca</DialogTitle>
          <DialogDescription>
            Cadastre uma marca de filamento para acompanhar preço e qualidade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <BrandFormFields form={form} />
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
