"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  CircleCheckIcon,
  LayersIcon,
  LightbulbIcon,
  NotebookTextIcon,
  PlusIcon,
  StethoscopeIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  journalStatusOptions,
  type JournalFormInput,
} from "@/lib/schemas/journal";
import type { FilamentOption } from "@/lib/types/filament";
import { filamentTypeLabels } from "@/components/brand-form-fields";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import { FieldIcon } from "@/components/field-icon";
import { DatePickerField } from "@/components/date-picker-field";

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

export const journalStatusLabels: Record<
  (typeof journalStatusOptions)[number],
  string
> = {
  resolvido: "Resolvido",
  nao_resolvido: "Não resolvido",
  em_andamento: "Em andamento",
};

export const journalStatusColors: Record<
  (typeof journalStatusOptions)[number],
  string
> = {
  resolvido: "text-green-600 dark:text-green-400",
  nao_resolvido: "text-red-600 dark:text-red-400",
  em_andamento: "text-yellow-600 dark:text-yellow-400",
};

export function JournalFormFields({
  form,
  filamentOptions,
}: {
  form: UseFormReturn<JournalFormInput>;
  filamentOptions: FilamentOption[];
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attempts",
  });

  return (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.title}>
        <FieldLabel htmlFor="journal-title">
          <FieldIcon icon={TypeIcon} color="chart-1" />
          Título
        </FieldLabel>
        <FieldContent>
          <Input
            id="journal-title"
            placeholder="Ex: Warping em extremidade de peça comprida (PLA)"
            {...form.register("title")}
          />
          <FieldError errors={[form.formState.errors.title]} />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <DatePickerField
          id="journal-date"
          label="Data"
          value={form.watch("entryDate") ?? ""}
          onChange={(value) => form.setValue("entryDate", value)}
          errors={[form.formState.errors.entryDate]}
        />

        <Field data-invalid={!!form.formState.errors.status}>
          <FieldLabel htmlFor="journal-status">
            <FieldIcon icon={CircleCheckIcon} color="chart-2" />
            Status
          </FieldLabel>
          <FieldContent>
            <Select
              items={journalStatusOptions.map((option) => ({
                value: option,
                label: journalStatusLabels[option],
              }))}
              value={form.watch("status") ?? ""}
              onValueChange={(value) =>
                form.setValue("status", value as JournalFormInput["status"])
              }
            >
              <SelectTrigger id="journal-status" className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {journalStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {journalStatusLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.status]} />
          </FieldContent>
        </Field>
      </div>

      <Field data-invalid={!!form.formState.errors.filamentId}>
        <FieldLabel htmlFor="journal-filament">
          <FieldIcon icon={LayersIcon} color="chart-1" />
          Filamento (opcional)
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
            <SelectTrigger id="journal-filament" className="w-full">
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

      <Field data-invalid={!!form.formState.errors.symptom}>
        <FieldLabel htmlFor="journal-symptom">
          <FieldIcon icon={StethoscopeIcon} color="chart-4" />
          Sintoma
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="journal-symptom"
            placeholder="Descreva o que foi observado..."
            {...form.register("symptom")}
          />
          <FieldError errors={[form.formState.errors.symptom]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.possibleCauses}>
        <FieldLabel htmlFor="journal-possible-causes">
          <FieldIcon icon={LightbulbIcon} color="chart-5" />
          Possíveis causas
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="journal-possible-causes"
            placeholder="Ex: corrente de ar, fan de resfriamento muito forte..."
            {...form.register("possibleCauses")}
          />
          <FieldError errors={[form.formState.errors.possibleCauses]} />
        </FieldContent>
      </Field>

      <FieldSeparator>O que foi testado</FieldSeparator>

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => {
          const worked = form.watch(`attempts.${index}.worked`);

          return (
            <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <Textarea
                placeholder="Descreva a tentativa..."
                {...form.register(`attempts.${index}.attempt` as const)}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={worked === true ? "default" : "outline"}
                    size="icon-sm"
                    aria-label="Resolveu o problema"
                    onClick={() =>
                      form.setValue(
                        `attempts.${index}.worked`,
                        worked === true ? undefined : true
                      )
                    }
                  >
                    <ThumbsUpIcon />
                  </Button>
                  <Button
                    type="button"
                    variant={worked === false ? "destructive" : "outline"}
                    size="icon-sm"
                    aria-label="Não resolveu o problema"
                    onClick={() =>
                      form.setValue(
                        `attempts.${index}.worked`,
                        worked === false ? undefined : false
                      )
                    }
                  >
                    <ThumbsDownIcon />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => append({ attempt: "", worked: undefined })}
        >
          <PlusIcon />
          Adicionar tentativa
        </Button>
      </div>

      <Field data-invalid={!!form.formState.errors.notes}>
        <FieldLabel htmlFor="journal-notes">
          <FieldIcon icon={NotebookTextIcon} color="chart-1" />
          Notas
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="journal-notes"
            placeholder="Observações adicionais..."
            {...form.register("notes")}
          />
          <FieldError errors={[form.formState.errors.notes]} />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
