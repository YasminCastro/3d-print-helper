"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createFilamentAction } from "@/lib/actions/filaments";
import {
  filamentFormSchema,
  type FilamentFormInput,
} from "@/lib/schemas/filament";
import { getErrorMessage } from "@/lib/utils";
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
  rating: undefined,
  color: "",
  color2: "",
};

export function FilamentFormDialog({
  brandOptions,
  trigger,
}: {
  brandOptions: { id: number; name: string }[];
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FilamentFormInput>({
    resolver: zodResolver(filamentFormSchema),
    defaultValues,
  });

  function onSubmit(values: FilamentFormInput) {
    startTransition(async () => {
      try {
        await createFilamentAction(values);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível salvar o filamento"));
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
            Novo Filamento
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Filamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FilamentFormFields form={form} brandOptions={brandOptions} />
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
