"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ActivityIcon,
  AlertTriangle,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2,
  DropletIcon,
  Gauge,
  HashIcon,
  Layers,
  MoveHorizontalIcon,
  NotebookTextIcon,
  PencilIcon,
  SlidersHorizontalIcon,
  ThermometerIcon,
  Trash2Icon,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  deleteCalibrationAction,
  updateCalibrationAction,
} from "@/lib/actions/calibrations";
import {
  calibrationFormSchema,
  type CalibrationFormInput,
} from "@/lib/schemas/calibration";
import type { CalibrationWithFilament } from "@/lib/types/calibration";
import type { FilamentOption } from "@/lib/types/filament";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  CalibrationFormFields,
  calibrationStatusLabels,
  slicerLabels,
} from "@/components/calibration-form-fields";
import { filamentTypeLabels } from "@/components/brand-form-fields";
import { filamentBannerStyle, filamentIconStyle } from "@/lib/filament-accent";
import type {
  calibrationStatusOptions,
  slicerOptions,
} from "@/lib/schemas/calibration";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import { PrinterStatCard, type StatColor } from "@/components/printer-stat-card";

const statusIcons: Record<(typeof calibrationStatusOptions)[number], typeof CheckCircle2> = {
  calibrado: CheckCircle2,
  nao_calibrado: XCircle,
  em_processo: AlertTriangle,
};

const statusStatColors: Record<(typeof calibrationStatusOptions)[number], StatColor> = {
  calibrado: "green",
  nao_calibrado: "red",
  em_processo: "yellow",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

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
    purchaseBatch: calibration.purchase_batch ?? "",
    notes: calibration.notes ?? "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function CalibrationDetailView({
  calibration,
  filamentOptions,
}: {
  calibration: CalibrationWithFilament;
  filamentOptions: FilamentOption[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CalibrationFormInput>({
    resolver: zodResolver(calibrationFormSchema),
    defaultValues: toFormValues(calibration),
  });

  function onSubmit(values: CalibrationFormInput) {
    startTransition(async () => {
      await updateCalibrationAction(calibration.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteCalibrationAction(calibration.id);
      router.push("/calibrations");
    });
  }

  const slicer = calibration.slicer as (typeof slicerOptions)[number];
  const status = calibration.status as
    | (typeof calibrationStatusOptions)[number]
    | null;
  const material = calibration.filament_material as
    | (typeof filamentTypeOptions)[number]
    | null;
  const bannerStyle = filamentBannerStyle([calibration.filament_color]);
  const iconStyle = filamentIconStyle([calibration.filament_color]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/calibrations"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </Link>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button type="button" variant="ghost" size="icon-sm" />}
              >
                <Trash2Icon />
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
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 ring-1 ring-foreground/10">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <PencilIcon className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">Editar calibração</h1>
              <p className="text-sm text-muted-foreground">
                {calibration.filament_name ?? "Calibração"}
              </p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CalibrationFormFields
                  form={form}
                  filamentOptions={filamentOptions}
                />
                <div className="mt-4 flex justify-end gap-2">
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
                    {isPending && <Spinner />}
                    {isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "flex items-center gap-4 rounded-xl p-5 ring-1 ring-foreground/10",
              !bannerStyle && "bg-linear-to-br from-primary/15 via-primary/5 to-transparent"
            )}
            style={bannerStyle}
          >
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                !iconStyle && "bg-primary/15 text-primary"
              )}
              style={iconStyle}
            >
              <Gauge className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">
                {calibration.filament_name ?? "Calibração"}
              </h1>
              <p className="text-sm text-muted-foreground">{slicerLabels[slicer]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PrinterStatCard
              icon={Gauge}
              label="Fatiador"
              color="chart-2"
              value={slicerLabels[slicer]}
            />
            <PrinterStatCard
              icon={Layers}
              label="Filamento"
              color="chart-1"
              value={
                <span className="flex items-center gap-2">
                  {calibration.filament_color && (
                    <span
                      className="size-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: calibration.filament_color }}
                    />
                  )}
                  {calibration.filament_name ?? "—"}
                  {material && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({filamentTypeLabels[material] ?? material})
                    </span>
                  )}
                </span>
              }
            />
            <PrinterStatCard
              icon={status ? statusIcons[status] : CheckCircle2}
              label="Status"
              color={status ? statusStatColors[status] : "chart-3"}
              value={status ? calibrationStatusLabels[status] : "—"}
            />
            <PrinterStatCard
              icon={CalendarIcon}
              label="Data de calibração"
              color="chart-3"
              value={formatDate(calibration.calibration_date)}
            />
            <PrinterStatCard
              icon={HashIcon}
              label="Lote do filamento"
              color="chart-1"
              value={calibration.purchase_batch ?? "—"}
            />
          </div>

          {slicer === "orca" && (
            <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                  <SlidersHorizontalIcon className="size-3.5" />
                </span>
                Configurações do Orca Slicer
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. mesa 1ª camada"
                  color="chart-3"
                  value={
                    calibration.bed_temp_first_layer != null
                      ? `${calibration.bed_temp_first_layer}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. mesa demais camadas"
                  color="chart-3"
                  value={
                    calibration.bed_temp_other_layers != null
                      ? `${calibration.bed_temp_other_layers}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. bico inicial"
                  color="chart-5"
                  value={
                    calibration.nozzle_temp_initial != null
                      ? `${calibration.nozzle_temp_initial}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. bico final"
                  color="chart-5"
                  value={
                    calibration.nozzle_temp_final != null
                      ? `${calibration.nozzle_temp_final}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ActivityIcon}
                  label="Max Volumetric Speed"
                  color="chart-2"
                  value={
                    calibration.max_volumetric_speed != null
                      ? `${calibration.max_volumetric_speed} mm³/s`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ActivityIcon}
                  label="Pressure Advance"
                  color="chart-2"
                  value={calibration.pressure_advance ?? "—"}
                />
                <PrinterStatCard
                  icon={DropletIcon}
                  label="Fluxo"
                  color="chart-4"
                  value={calibration.flow_ratio ?? "—"}
                />
                <PrinterStatCard
                  icon={MoveHorizontalIcon}
                  label="Retração de distância"
                  color="chart-1"
                  value={
                    calibration.retraction_distance != null
                      ? `${calibration.retraction_distance} mm`
                      : "—"
                  }
                />
              </div>
            </div>
          )}

          {slicer === "creality" && (
            <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                  <SlidersHorizontalIcon className="size-3.5" />
                </span>
                Configurações do Creality Slicer
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. mesa 1ª camada"
                  color="chart-3"
                  value={
                    calibration.bed_temp_first_layer != null
                      ? `${calibration.bed_temp_first_layer}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. mesa demais camadas"
                  color="chart-3"
                  value={
                    calibration.bed_temp_other_layers != null
                      ? `${calibration.bed_temp_other_layers}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. bico inicial"
                  color="chart-5"
                  value={
                    calibration.nozzle_temp_initial != null
                      ? `${calibration.nozzle_temp_initial}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ThermometerIcon}
                  label="Temp. bico final"
                  color="chart-5"
                  value={
                    calibration.nozzle_temp_final != null
                      ? `${calibration.nozzle_temp_final}°C`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ActivityIcon}
                  label="Max Volumetric Speed"
                  color="chart-2"
                  value={
                    calibration.max_volumetric_speed != null
                      ? `${calibration.max_volumetric_speed} mm³/s`
                      : "—"
                  }
                />
                <PrinterStatCard
                  icon={ActivityIcon}
                  label="Pressure Advance"
                  color="chart-2"
                  value={calibration.pressure_advance ?? "—"}
                />
                <PrinterStatCard
                  icon={DropletIcon}
                  label="Flow ratio"
                  color="chart-4"
                  value={calibration.flow_ratio ?? "—"}
                />
                <PrinterStatCard
                  icon={MoveHorizontalIcon}
                  label="Retração"
                  color="chart-1"
                  value={
                    calibration.retraction_distance != null
                      ? `${calibration.retraction_distance} mm`
                      : "—"
                  }
                />
              </div>
            </div>
          )}

          {calibration.notes && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-1/15 text-chart-1">
                  <NotebookTextIcon className="size-3.5" />
                </span>
                Notas
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {calibration.notes}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
