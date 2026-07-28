"use client";

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

const defaultValues: CalibrationFormInput = {
  slicer: undefined as unknown as CalibrationFormInput["slicer"],
  filamentId: "",
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
  notes: "",
};

export function CalibrationFormDialog({
  filamentOptions,
}: {
  filamentOptions: FilamentOption[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Nova Calibração
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Calibração</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CalibrationFormFields form={form} filamentOptions={filamentOptions} />
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
