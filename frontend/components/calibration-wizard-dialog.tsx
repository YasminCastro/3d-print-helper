"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  DropletIcon,
  HashIcon,
  Info,
  Layers,
  MoveHorizontalIcon,
  NotebookTextIcon,
  PlayIcon,
  ThermometerIcon,
} from "lucide-react";

import { createCalibrationAction } from "@/lib/actions/calibrations";
import {
  calibrationFormSchema,
  calibrationStatusOptions,
  type CalibrationFormInput,
} from "@/lib/schemas/calibration";
import type { FilamentOption } from "@/lib/types/filament";
import {
  GUIDE_STEPS_BY_SLICER,
  type ParamFieldKey,
} from "@/lib/slicer-calibration-guides";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldIcon } from "@/components/field-icon";
import { DatePickerField } from "@/components/date-picker-field";
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireProgress,
} from "@/components/ui/questionnaire";
import {
  calibrationStatusLabels,
  filamentOptionLabel,
  slicerLabels,
} from "@/components/calibration-form-fields";
import { cn } from "@/lib/utils";

type FilamentComboItem = { value: string; label: string };

type FieldDefinition = {
  label: string;
  placeholder: string;
  icon: LucideIcon;
};

const FIELD_DEFINITIONS: Record<ParamFieldKey, FieldDefinition> = {
  bedTempFirstLayer: {
    label: "Temperatura mesa 1ª camada (°C)",
    placeholder: "Ex: 60",
    icon: ThermometerIcon,
  },
  bedTempOtherLayers: {
    label: "Temperatura mesa demais camadas (°C)",
    placeholder: "Ex: 55",
    icon: ThermometerIcon,
  },
  nozzleTempInitial: {
    label: "Temperatura do bico (°C)",
    placeholder: "Ex: 220",
    icon: ThermometerIcon,
  },
  nozzleTempFinal: {
    label: "Temperatura do bico – ajuste fino (°C)",
    placeholder: "Ex: 210",
    icon: ThermometerIcon,
  },
  maxVolumetricSpeed: {
    label: "Max Volumetric Speed (mm³/s)",
    placeholder: "Ex: 12",
    icon: ActivityIcon,
  },
  pressureAdvance: {
    label: "Pressure Advance",
    placeholder: "Ex: 0.045",
    icon: ActivityIcon,
  },
  flowRatio: {
    label: "Flow Ratio",
    placeholder: "Ex: 0.98",
    icon: DropletIcon,
  },
  retractionDistance: {
    label: "Distância de retração (mm)",
    placeholder: "Ex: 0.8",
    icon: MoveHorizontalIcon,
  },
};

function buildDefaultValues(slicer: "orca" | "creality"): CalibrationFormInput {
  return {
    slicer,
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
    purchaseBatch: "",
    notes: "",
  };
}

export function CalibrationWizardDialog({
  slicer,
  filamentOptions,
}: {
  slicer: "orca" | "creality";
  filamentOptions: FilamentOption[];
}) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const guideSteps = GUIDE_STEPS_BY_SLICER[slicer];
  const totalSteps = guideSteps.length + 1; // general + guide steps (last one doubles as review)
  const isGeneralStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const questionnaireItemNames = useMemo(
    () => ["general", ...guideSteps.map((step) => `step-${step.number}`)],
    [guideSteps]
  );
  const questionnaireItems = useMemo(
    () => questionnaireItemNames.map((name) => ({ name, required: false })),
    [questionnaireItemNames]
  );
  const activeQuestionnaireItem = questionnaireItemNames[stepIndex] ?? questionnaireItemNames[0];

  const defaultValues = buildDefaultValues(slicer);

  const form = useForm<CalibrationFormInput>({
    resolver: zodResolver(calibrationFormSchema),
    defaultValues,
  });

  const sortedFilamentOptions = [...filamentOptions].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );
  const filamentItems: FilamentComboItem[] = sortedFilamentOptions.map((filament) => ({
    value: String(filament.id),
    label: filamentOptionLabel(filament),
  }));

  function resetWizard() {
    form.reset(defaultValues);
    setStepIndex(0);
  }

  async function handleNext() {
    if (isGeneralStep) {
      const valid = await form.trigger(["filamentId", "slicer"]);
      if (!valid) return;
    }
    setStepIndex((index) => Math.min(index + 1, totalSteps - 1));
  }

  function handleBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function onSubmit(values: CalibrationFormInput) {
    startTransition(async () => {
      await createCalibrationAction(values);
      resetWizard();
      setOpen(false);
    });
  }

  const watchedValues = form.watch();
  const selectedFilament = sortedFilamentOptions.find(
    (filament) => String(filament.id) === watchedValues.filamentId
  );

  const reviewFieldEntries = guideSteps
    .flatMap((step) => step.fieldKeys)
    .filter((key, index, all) => all.indexOf(key) === index)
    .map((key) => ({ key, definition: FIELD_DEFINITIONS[key], value: watchedValues[key] }))
    .filter(
      (entry): entry is { key: ParamFieldKey; definition: FieldDefinition; value: number } =>
        entry.value !== undefined && !Number.isNaN(entry.value)
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetWizard();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlayIcon />
        Iniciar calibração
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Calibração passo a passo — {slicerLabels[slicer]}</DialogTitle>
        </DialogHeader>

        <Questionnaire
          item={activeQuestionnaireItem}
          items={questionnaireItems}
          onItemChange={() => {}}
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col gap-4"
        >
          <QuestionnaireProgress
            className="flex items-center gap-1.5"
            render={(props, state) => (
              <div {...props}>
                {Array.from({ length: state.total }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      index < state.current ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            )}
          />

          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Passo {stepIndex + 1} de {totalSteps}
          </p>

          <QuestionnaireItem name="general">
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.filamentId}>
                <FieldLabel htmlFor="wizard-filament">
                  <FieldIcon icon={Layers} color="chart-1" />
                  Filamento
                </FieldLabel>
                <FieldContent>
                  <Combobox
                    items={filamentItems}
                    value={
                      filamentItems.find((item) => item.value === form.watch("filamentId")) ??
                      null
                    }
                    onValueChange={(item) =>
                      form.setValue(
                        "filamentId",
                        (item as FilamentComboItem | null)?.value ?? ""
                      )
                    }
                  >
                    <ComboboxInputGroup>
                      <ComboboxInput
                        id="wizard-filament"
                        placeholder="Pesquisar filamento..."
                      />
                      <ComboboxClear aria-label="Limpar seleção" />
                      <ComboboxTrigger aria-label="Abrir lista" />
                    </ComboboxInputGroup>
                    <ComboboxContent>
                      <ComboboxEmpty>Nenhum filamento encontrado.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: FilamentComboItem) => {
                          const filament = sortedFilamentOptions.find(
                            (option) => String(option.id) === item.value
                          );
                          return (
                            <ComboboxItem key={item.value} value={item}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="size-3.5 shrink-0 rounded-full border"
                                  style={{ backgroundColor: filament?.color ?? "#a1a1aa" }}
                                />
                                {item.label}
                              </span>
                            </ComboboxItem>
                          );
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldError errors={[form.formState.errors.filamentId]} />
                </FieldContent>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!form.formState.errors.status}>
                  <FieldLabel htmlFor="wizard-status">
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
                      <SelectTrigger id="wizard-status" className="w-full">
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

                <DatePickerField
                  id="wizard-date"
                  label="Data de calibração"
                  value={form.watch("calibrationDate") ?? ""}
                  onChange={(value) => form.setValue("calibrationDate", value)}
                  errors={[form.formState.errors.calibrationDate]}
                />
              </div>

              <Field data-invalid={!!form.formState.errors.purchaseBatch}>
                <FieldLabel htmlFor="wizard-purchase-batch">
                  <FieldIcon icon={HashIcon} color="chart-1" />
                  Lote
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="wizard-purchase-batch"
                    placeholder="Ex: L2024-08"
                    {...form.register("purchaseBatch")}
                  />
                  <FieldError errors={[form.formState.errors.purchaseBatch]} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </QuestionnaireItem>

          {guideSteps.map((step, index) => {
            const isLastGuideStep = index === guideSteps.length - 1;

            return (
              <QuestionnaireItem key={step.number} name={`step-${step.number}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 text-sm">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <step.icon className="size-4 shrink-0 text-muted-foreground" />
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.goal}</p>

                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Como fazer
                      </h4>
                      <ol className="list-decimal space-y-1 pl-4">
                        {step.howTo.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Como analisar o resultado
                      </h4>
                      <ul className="list-disc space-y-1 pl-4">
                        {step.analysis.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <p>
                        <span className="font-medium">O que fazer:</span> {step.action}
                      </p>
                    </div>

                    {step.tip && (
                      <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
                        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <p>
                          <span className="font-medium">Dica de Ouro:</span> {step.tip}
                        </p>
                      </div>
                    )}
                  </div>

                  <FieldGroup>
                    <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Valores encontrados
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      {step.fieldKeys.map((key) => {
                        const definition = FIELD_DEFINITIONS[key];
                        return (
                          <Field key={key} data-invalid={!!form.formState.errors[key]}>
                            <FieldLabel htmlFor={`wizard-${key}`}>
                              <FieldIcon icon={definition.icon} color="chart-2" />
                              {definition.label}
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                id={`wizard-${key}`}
                                type="number"
                                step="any"
                                placeholder={definition.placeholder}
                                {...form.register(key, { valueAsNumber: true })}
                              />
                              <FieldError errors={[form.formState.errors[key]]} />
                            </FieldContent>
                          </Field>
                        );
                      })}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Não sabe esse valor ainda? Deixe em branco e continue — você pode preencher
                      depois editando a calibração.
                    </p>
                  </FieldGroup>

                  {isLastGuideStep && (
                    <FieldGroup>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-semibold">Resumo da calibração</h3>
                        <p className="text-sm text-muted-foreground">
                          Confira os valores preenchidos e salve a calibração.
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 rounded-md bg-muted/50 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Filamento</span>
                          <span className="font-medium">
                            {selectedFilament ? filamentOptionLabel(selectedFilament) : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <span className="font-medium">
                            {watchedValues.status
                              ? calibrationStatusLabels[watchedValues.status]
                              : "—"}
                          </span>
                        </div>
                        {reviewFieldEntries.map(({ key, definition, value }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{definition.label}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>

                      <Field data-invalid={!!form.formState.errors.notes}>
                        <FieldLabel htmlFor="wizard-notes">
                          <FieldIcon icon={NotebookTextIcon} color="chart-1" />
                          Notas
                        </FieldLabel>
                        <FieldContent>
                          <Textarea
                            id="wizard-notes"
                            placeholder="Observações sobre a calibração..."
                            {...form.register("notes")}
                          />
                          <FieldError errors={[form.formState.errors.notes]} />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  )}
                </div>
              </QuestionnaireItem>
            );
          })}

          <DialogFooter className="mt-2">
            {!isGeneralStep && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ChevronLeftIcon />
                Voltar
              </Button>
            )}
            {!isLastStep ? (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRightIcon />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isPending}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isPending ? <Spinner /> : <CheckIcon />}
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </DialogFooter>
        </Questionnaire>
      </DialogContent>
    </Dialog>
  );
}
