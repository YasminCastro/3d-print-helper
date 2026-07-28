"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, Trash2Icon } from "lucide-react";

import {
  deleteCalibrationAction,
  updateCalibrationAction,
} from "@/lib/actions/calibrations";
import {
  calibrationFormSchema,
  type CalibrationFormInput,
} from "@/lib/schemas/calibration";
import type { CalibrationWithFilament } from "@/lib/types/calibration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  CalibrationFormFields,
  calibrationStatusColors,
  calibrationStatusLabels,
  slicerLabels,
} from "@/components/calibration-form-fields";
import type {
  calibrationStatusOptions,
  slicerOptions,
} from "@/lib/schemas/calibration";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function toFormValues(
  calibration: CalibrationWithFilament,
): CalibrationFormInput {
  return {
    slicer: calibration.slicer as CalibrationFormInput["slicer"],
    filamentId:
      calibration.filament_id != null ? String(calibration.filament_id) : "",
    status: (calibration.status as CalibrationFormInput["status"]) ?? undefined,
    calibrationDate: calibration.calibration_date ?? "",
    bedTempFirstLayer: calibration.bed_temp_first_layer ?? undefined,
    bedTempOtherLayers: calibration.bed_temp_other_layers ?? undefined,
    nozzleTempInitial: calibration.nozzle_temp_initial ?? undefined,
    nozzleTempFinal: calibration.nozzle_temp_final ?? undefined,
    maxVolumetricSpeed: calibration.max_volumetric_speed ?? undefined,
    pressureAdvance: calibration.pressure_advance ?? undefined,
    flowRatio: calibration.flow_ratio ?? undefined,
    retractionDistance: calibration.retraction_distance ?? undefined,
    notes: calibration.notes ?? "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function CalibrationDetailsDialog({
  calibration,
  filamentOptions,
  open,
  onOpenChange,
}: {
  calibration: CalibrationWithFilament;
  filamentOptions: { id: number; name: string; color: string | null }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CalibrationFormInput>({
    resolver: zodResolver(calibrationFormSchema),
    defaultValues: toFormValues(calibration),
  });

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      form.reset(toFormValues(calibration));
    }
  }, [open, calibration, form]);

  function onSubmit(values: CalibrationFormInput) {
    startTransition(async () => {
      await updateCalibrationAction(calibration.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteCalibrationAction(calibration.id);
      onOpenChange(false);
    });
  }

  const slicer = calibration.slicer as (typeof slicerOptions)[number];
  const status = calibration.status as
    | (typeof calibrationStatusOptions)[number]
    | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Editar Calibração"
              : (calibration.filament_name ?? "Calibração")}
          </DialogTitle>
          {!isEditing && (
            <DialogDescription>
              Informações cadastradas da calibração.
            </DialogDescription>
          )}
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CalibrationFormFields
              form={form}
              filamentOptions={filamentOptions}
            />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  form.reset(toFormValues(calibration));
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Fatiador</dt>
              <dd>{slicerLabels[slicer]}</dd>

              <dt className="text-muted-foreground">Filamento</dt>
              <dd className="flex items-center gap-2">
                {calibration.filament_color && (
                  <span
                    className="size-4 shrink-0 rounded-full border"
                    style={{ backgroundColor: calibration.filament_color }}
                  />
                )}
                {calibration.filament_name ?? "—"}
              </dd>

              <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Status</dt>
                <dt className="text-muted-foreground">Data de calibração</dt>
                <dd
                  className={
                    status ? calibrationStatusColors[status] : undefined
                  }
                >
                  {status ? calibrationStatusLabels[status] : "—"}
                </dd>
                <dd>{formatDate(calibration.calibration_date)}</dd>
              </div>

              {slicer === "orca" && (
                <>
                  <div className="col-span-2 flex items-center gap-2 py-1">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      Configurações do Orca Slicer
                    </span>
                    <Separator className="flex-1" />
                  </div>

                  <dt className="text-muted-foreground">
                    Temp. mesa 1ª camada
                  </dt>
                  <dd>
                    {calibration.bed_temp_first_layer != null
                      ? `${calibration.bed_temp_first_layer}°C`
                      : "—"}
                  </dd>

                  <dt className="text-muted-foreground">
                    Temp. mesa demais camadas
                  </dt>
                  <dd>
                    {calibration.bed_temp_other_layers != null
                      ? `${calibration.bed_temp_other_layers}°C`
                      : "—"}
                  </dd>

                  <dt className="text-muted-foreground">Temp. bico inicial</dt>
                  <dd>
                    {calibration.nozzle_temp_initial != null
                      ? `${calibration.nozzle_temp_initial}°C`
                      : "—"}
                  </dd>

                  <dt className="text-muted-foreground">Temp. bico final</dt>
                  <dd>
                    {calibration.nozzle_temp_final != null
                      ? `${calibration.nozzle_temp_final}°C`
                      : "—"}
                  </dd>

                  <dt className="text-muted-foreground">
                    Max Volumetric Speed
                  </dt>
                  <dd>
                    {calibration.max_volumetric_speed != null
                      ? `${calibration.max_volumetric_speed} mm³/s`
                      : "—"}
                  </dd>

                  <dt className="text-muted-foreground">Pressure Advance</dt>
                  <dd>{calibration.pressure_advance ?? "—"}</dd>

                  <dt className="text-muted-foreground">Fluxo</dt>
                  <dd>{calibration.flow_ratio ?? "—"}</dd>

                  <dt className="text-muted-foreground">
                    Retração de distância
                  </dt>
                  <dd>
                    {calibration.retraction_distance != null
                      ? `${calibration.retraction_distance} mm`
                      : "—"}
                  </dd>

                  <dt className="text-muted-foreground">Notas</dt>
                  <dd className="whitespace-pre-wrap">
                    {calibration.notes ?? "—"}
                  </dd>
                </>
              )}
            </dl>

            <DialogFooter className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button type="button" variant="destructive" />}
                >
                  <Trash2Icon />
                  Excluir
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir calibração?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A calibração será
                      removida permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isPending}
                      onClick={onDelete}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="button" onClick={() => setIsEditing(true)}>
                <PencilIcon />
                Editar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
