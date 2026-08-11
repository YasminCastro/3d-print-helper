"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";

import { createCalibrationAction } from "@/lib/actions/calibrations";
import {
  calibrationFormSchema,
  type CalibrationFormInput,
} from "@/lib/schemas/calibration";
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
import { CalibrationFormFields } from "@/components/calibration-form-fields";
import type { FilamentOption } from "@/lib/types/filament";

function buildDefaultValues(lastPrinterId?: number | null): CalibrationFormInput {
  return {
    slicer: undefined as unknown as CalibrationFormInput["slicer"],
    filamentId: "",
    printerId: lastPrinterId ? String(lastPrinterId) : "",
    status: undefined,
    calibrationDate: "",
    bedTempFirstLayer: undefined,
    bedTempOtherLayers: undefined,
    nozzleTempInitial: undefined,
    nozzleTempFinal: undefined,
    maxVolumetricSpeed: undefined,
    pressureAdvance: undefined,
    flowRatio: undefined,
    retractionDistance: undefined,
    purchaseBatch: "",
    notes: "",
  };
}

export function CalibrationFormDialog({
  filamentOptions,
  printerOptions,
  lastPrinterId,
  trigger,
}: {
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  lastPrinterId?: number | null;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const defaultValues = buildDefaultValues(lastPrinterId);

  const form = useForm<CalibrationFormInput>({
    resolver: zodResolver(calibrationFormSchema),
    defaultValues,
  });

  function onSubmit(values: CalibrationFormInput) {
    startTransition(async () => {
      await createCalibrationAction(values);
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
            Nova Calibração
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Calibração</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CalibrationFormFields
            form={form}
            filamentOptions={filamentOptions}
            printerOptions={printerOptions}
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
