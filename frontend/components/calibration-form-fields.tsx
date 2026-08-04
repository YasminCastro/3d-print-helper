"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  ActivityIcon,
  CalendarIcon,
  CircleCheckIcon,
  DropletIcon,
  Gauge,
  Layers,
  MoveHorizontalIcon,
  NotebookTextIcon,
  ThermometerIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  calibrationStatusOptions,
  slicerOptions,
  type CalibrationFormInput,
} from "@/lib/schemas/calibration";
import type { FilamentOption } from "@/lib/types/filament";
import { filamentTypeLabels } from "@/components/brand-form-fields";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import { FieldIcon } from "@/components/field-icon";

function filamentOptionLabel(filament: FilamentOption) {
  const parts = [filament.name];
  if (filament.material) {
    parts.push(
      filamentTypeLabels[filament.material as (typeof filamentTypeOptions)[number]] ??
        filament.material
    );
  }
  if (filament.brand_name) parts.push(filament.brand_name);
  return parts.join(" - ");
}

export const slicerLabels: Record<(typeof slicerOptions)[number], string> = {
  orca: "Orca",
  creality: "Creality",
};

export const calibrationStatusLabels: Record<
  (typeof calibrationStatusOptions)[number],
  string
> = {
  calibrado: "Calibrado",
  nao_calibrado: "Não calibrado",
  em_processo: "Em processo",
};

export const calibrationStatusColors: Record<
  (typeof calibrationStatusOptions)[number],
  string
> = {
  calibrado: "text-green-600 dark:text-green-400",
  nao_calibrado: "text-red-600 dark:text-red-400",
  em_processo: "text-yellow-600 dark:text-yellow-400",
};

export function CalibrationFormFields({
  form,
  filamentOptions,
}: {
  form: UseFormReturn<CalibrationFormInput>;
  filamentOptions: FilamentOption[];
}) {
  return (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.slicer}>
        <FieldLabel htmlFor="calibration-slicer">
          <FieldIcon icon={Gauge} color="chart-2" />
          Fatiador
        </FieldLabel>
        <FieldContent>
          <Select
            items={slicerOptions.map((option) => ({
              value: option,
              label: slicerLabels[option],
            }))}
            value={form.watch("slicer") ?? ""}
            onValueChange={(value) =>
              form.setValue("slicer", value as CalibrationFormInput["slicer"])
            }
          >
            <SelectTrigger id="calibration-slicer" className="w-full">
              <SelectValue placeholder="Selecione o fatiador" />
            </SelectTrigger>
            <SelectContent>
              {slicerOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {slicerLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[form.formState.errors.slicer]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.filamentId}>
        <FieldLabel htmlFor="calibration-filament">
          <FieldIcon icon={Layers} color="chart-1" />
          Filamento
        </FieldLabel>
        <FieldContent>
          <Select
            items={filamentOptions.map((filament) => ({
              value: String(filament.id),
              label: filamentOptionLabel(filament),
            }))}
            value={form.watch("filamentId") ?? ""}
            onValueChange={(value) => form.setValue("filamentId", value ?? "")}
          >
            <SelectTrigger id="calibration-filament" className="w-full">
              <SelectValue placeholder="Selecione o filamento" />
            </SelectTrigger>
            <SelectContent>
              {filamentOptions.map((filament) => (
                <SelectItem key={filament.id} value={String(filament.id)}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3.5 shrink-0 rounded-full border"
                      style={{ backgroundColor: filament.color ?? "#a1a1aa" }}
                    />
                    {filamentOptionLabel(filament)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[form.formState.errors.filamentId]} />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.status}>
          <FieldLabel htmlFor="calibration-status">
            <FieldIcon icon={CircleCheckIcon} color="chart-3" />
            Status
          </FieldLabel>
          <FieldContent>
            <Select
              items={calibrationStatusOptions.map((option) => ({
                value: option,
                label: calibrationStatusLabels[option],
              }))}
              value={form.watch("status") ?? ""}
              onValueChange={(value) =>
                form.setValue("status", value as CalibrationFormInput["status"])
              }
            >
              <SelectTrigger id="calibration-status" className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {calibrationStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {calibrationStatusLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.status]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.calibrationDate}>
          <FieldLabel htmlFor="calibration-date">
            <FieldIcon icon={CalendarIcon} color="chart-3" />
            Data de calibração
          </FieldLabel>
          <FieldContent>
            <Input
              id="calibration-date"
              type="date"
              {...form.register("calibrationDate")}
            />
            <FieldError errors={[form.formState.errors.calibrationDate]} />
          </FieldContent>
        </Field>
      </div>

      {form.watch("slicer") === "orca" && (
        <>
          <FieldSeparator>Configurações do Orca Slicer</FieldSeparator>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.bedTempFirstLayer}>
              <FieldLabel htmlFor="calibration-bed-first">
                <FieldIcon icon={ThermometerIcon} color="chart-3" />
                Temperatura mesa 1ª camada (°C)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-bed-first"
                  type="number"
                  step="any"
                  placeholder="Ex: 60"
                  {...form.register("bedTempFirstLayer", {
                    valueAsNumber: true,
                  })}
                />
                <FieldError
                  errors={[form.formState.errors.bedTempFirstLayer]}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.bedTempOtherLayers}>
              <FieldLabel htmlFor="calibration-bed-other">
                <FieldIcon icon={ThermometerIcon} color="chart-3" />
                Temperatura mesa demais camadas (°C)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-bed-other"
                  type="number"
                  step="any"
                  placeholder="Ex: 55"
                  {...form.register("bedTempOtherLayers", {
                    valueAsNumber: true,
                  })}
                />
                <FieldError
                  errors={[form.formState.errors.bedTempOtherLayers]}
                />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.nozzleTempInitial}>
              <FieldLabel htmlFor="calibration-nozzle-initial">
                <FieldIcon icon={ThermometerIcon} color="chart-5" />
                Temperatura bico inicial (°C)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-nozzle-initial"
                  type="number"
                  step="any"
                  placeholder="Ex: 220"
                  {...form.register("nozzleTempInitial", {
                    valueAsNumber: true,
                  })}
                />
                <FieldError
                  errors={[form.formState.errors.nozzleTempInitial]}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.nozzleTempFinal}>
              <FieldLabel htmlFor="calibration-nozzle-final">
                <FieldIcon icon={ThermometerIcon} color="chart-5" />
                Temperatura bico final (°C)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-nozzle-final"
                  type="number"
                  step="any"
                  placeholder="Ex: 210"
                  {...form.register("nozzleTempFinal", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.nozzleTempFinal]} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.maxVolumetricSpeed}>
              <FieldLabel htmlFor="calibration-max-volumetric-speed">
                <FieldIcon icon={ActivityIcon} color="chart-2" />
                Max Volumetric Speed (mm³/s)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-max-volumetric-speed"
                  type="number"
                  step="any"
                  placeholder="Ex: 12"
                  {...form.register("maxVolumetricSpeed", {
                    valueAsNumber: true,
                  })}
                />
                <FieldError
                  errors={[form.formState.errors.maxVolumetricSpeed]}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.pressureAdvance}>
              <FieldLabel htmlFor="calibration-pressure-advance">
                <FieldIcon icon={ActivityIcon} color="chart-2" />
                Pressure Advance
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-pressure-advance"
                  type="number"
                  step="any"
                  placeholder="Ex: 0.045"
                  {...form.register("pressureAdvance", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.pressureAdvance]} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.flowRatio}>
              <FieldLabel htmlFor="calibration-flow-ratio">
                <FieldIcon icon={DropletIcon} color="chart-4" />
                Fluxo
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-flow-ratio"
                  type="number"
                  step="any"
                  placeholder="Ex: 0.98"
                  {...form.register("flowRatio", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.flowRatio]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.retractionDistance}>
              <FieldLabel htmlFor="calibration-retraction-distance">
                <FieldIcon icon={MoveHorizontalIcon} color="chart-1" />
                Retração de distância (mm)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="calibration-retraction-distance"
                  type="number"
                  step="any"
                  placeholder="Ex: 0.8"
                  {...form.register("retractionDistance", {
                    valueAsNumber: true,
                  })}
                />
                <FieldError
                  errors={[form.formState.errors.retractionDistance]}
                />
              </FieldContent>
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.notes}>
            <FieldLabel htmlFor="calibration-notes">
              <FieldIcon icon={NotebookTextIcon} color="chart-1" />
              Notas
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="calibration-notes"
                placeholder="Observações sobre a calibração..."
                {...form.register("notes")}
              />
              <FieldError errors={[form.formState.errors.notes]} />
            </FieldContent>
          </Field>
        </>
      )}
    </FieldGroup>
  );
}
