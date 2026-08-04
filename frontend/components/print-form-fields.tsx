"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  CalendarIcon,
  CircleCheckIcon,
  ClockIcon,
  ImageIcon,
  LayersIcon,
  LinkIcon,
  PercentIcon,
  Printer as PrinterIcon,
  PlusIcon,
  TagIcon,
  ThumbsUpIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PrintPhotoPicker } from "@/components/print-photo-picker";
import {
  NEW_CATEGORY_VALUE,
  printResultOptions,
  printStatusOptions,
  type PrintFormInput,
} from "@/lib/schemas/print";
import type { PrintCategory } from "@/lib/types/print";
import { categoryDotColorClass } from "@/lib/category-colors";
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

export const printStatusLabels: Record<(typeof printStatusOptions)[number], string> = {
  fila: "Fila",
  pronto: "Pronto",
};

export const printStatusColors: Record<(typeof printStatusOptions)[number], string> = {
  fila: "text-yellow-600 dark:text-yellow-400",
  pronto: "text-green-600 dark:text-green-400",
};

export const printStatusDotColors: Record<(typeof printStatusOptions)[number], string> = {
  fila: "bg-yellow-600 dark:bg-yellow-400",
  pronto: "bg-green-600 dark:bg-green-400",
};

export const printResultLabels: Record<(typeof printResultOptions)[number], string> = {
  ruim: "Ruim",
  razoavel: "Razoável",
  bom: "Bom",
  perfeito: "Perfeito",
};

export const printResultColors: Record<(typeof printResultOptions)[number], string> = {
  ruim: "text-red-600 dark:text-red-400",
  razoavel: "text-yellow-600 dark:text-yellow-400",
  bom: "text-lime-600 dark:text-lime-400",
  perfeito: "text-green-600 dark:text-green-400",
};

export const printResultDotColors: Record<(typeof printResultOptions)[number], string> = {
  ruim: "bg-red-600 dark:bg-red-400",
  razoavel: "bg-yellow-600 dark:bg-yellow-400",
  bom: "bg-lime-600 dark:bg-lime-400",
  perfeito: "bg-green-600 dark:bg-green-400",
};

export function PrintFormFields({
  form,
  photoFile,
  onPhotoFileChange,
  existingPhotoUrl,
  categoryOptions,
  filamentOptions,
  printerOptions,
}: {
  form: UseFormReturn<PrintFormInput>;
  photoFile: File | null;
  onPhotoFileChange: (file: File | null) => void;
  existingPhotoUrl?: string | null;
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
}) {
  const categoryId = form.watch("categoryId");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "filaments",
  });

  return (
    <FieldGroup>
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="print-name">
            <FieldIcon icon={TypeIcon} color="chart-1" />
            Nome
          </FieldLabel>
          <FieldContent>
            <Input
              id="print-name"
              placeholder="Ex: Suporte de celular"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.result}>
          <FieldLabel htmlFor="print-result">
            <FieldIcon icon={ThumbsUpIcon} color="chart-3" />
            Resultado
          </FieldLabel>
          <FieldContent>
            <Select
              items={printResultOptions.map((option) => ({
                value: option,
                label: printResultLabels[option],
              }))}
              value={form.watch("result") ?? ""}
              onValueChange={(value) =>
                form.setValue("result", value as PrintFormInput["result"])
              }
            >
              <SelectTrigger id="print-result" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {printResultOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`size-2.5 shrink-0 rounded-full ${printResultDotColors[option]}`}
                      />
                      {printResultLabels[option]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.result]} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.printDate}>
          <FieldLabel htmlFor="print-date">
            <FieldIcon icon={CalendarIcon} color="chart-3" />
            Data da impressão
          </FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-2">
              <Input id="print-date" type="date" {...form.register("printDate")} />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.setValue("printDate", new Date().toISOString().slice(0, 10))
                }
              >
                Hoje
              </Button>
            </div>
            <FieldError errors={[form.formState.errors.printDate]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.status}>
          <FieldLabel htmlFor="print-status">
            <FieldIcon icon={CircleCheckIcon} color="chart-2" />
            Status
          </FieldLabel>
          <FieldContent>
            <Select
              items={printStatusOptions.map((option) => ({
                value: option,
                label: printStatusLabels[option],
              }))}
              value={form.watch("status") ?? ""}
              onValueChange={(value) =>
                form.setValue("status", value as PrintFormInput["status"])
              }
            >
              <SelectTrigger id="print-status" className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {printStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`size-2.5 shrink-0 rounded-full ${printStatusDotColors[option]}`}
                      />
                      {printStatusLabels[option]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.status]} />
          </FieldContent>
        </Field>
      </div>

      <Field data-invalid={!!form.formState.errors.categoryId}>
        <FieldLabel htmlFor="print-category">
          <FieldIcon icon={TagIcon} color="chart-2" />
          Categoria
        </FieldLabel>
        <FieldContent>
          <Select
            items={[
              ...categoryOptions.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
              { value: NEW_CATEGORY_VALUE, label: "+ Criar nova categoria" },
            ]}
            value={categoryId ?? ""}
            onValueChange={(value) => {
              form.setValue("categoryId", value ?? "");
              if (value !== NEW_CATEGORY_VALUE) form.setValue("newCategoryName", "");
            }}
          >
            <SelectTrigger id="print-category" className="w-full">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${categoryDotColorClass(category.name)}`}
                    />
                    {category.name}
                  </span>
                </SelectItem>
              ))}
              <SelectItem value={NEW_CATEGORY_VALUE}>
                + Criar nova categoria
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError errors={[form.formState.errors.categoryId]} />

          {categoryId === NEW_CATEGORY_VALUE && (
            <Input
              className="mt-2"
              placeholder="Nome da nova categoria"
              {...form.register("newCategoryName")}
            />
          )}
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.printerId}>
          <FieldLabel htmlFor="print-printer">
            <FieldIcon icon={PrinterIcon} color="chart-2" />
            Impressora
          </FieldLabel>
          <FieldContent>
            <Select
              items={printerOptions.map((printer) => ({
                value: String(printer.id),
                label: printer.name,
              }))}
              value={form.watch("printerId") ?? ""}
              onValueChange={(value) => form.setValue("printerId", value ?? "")}
            >
              <SelectTrigger id="print-printer" className="w-full">
                <SelectValue placeholder="Selecione a impressora" />
              </SelectTrigger>
              <SelectContent>
                {printerOptions.map((printer) => (
                  <SelectItem key={printer.id} value={String(printer.id)}>
                    {printer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.printerId]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.profitPercent}>
          <FieldLabel htmlFor="print-profit-percent">
            <FieldIcon icon={PercentIcon} color="chart-4" />
            Lucro (%)
          </FieldLabel>
          <FieldContent>
            <Input
              id="print-profit-percent"
              type="number"
              step="any"
              placeholder="100"
              {...form.register("profitPercent", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.profitPercent]} />
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel>
          <FieldIcon icon={LayersIcon} color="chart-1" />
          Filamentos
        </FieldLabel>
        <FieldContent>
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Select
                    items={filamentOptions.map((filament) => ({
                      value: String(filament.id),
                      label: filamentOptionLabel(filament),
                    }))}
                    value={form.watch(`filaments.${index}.filamentId`) ?? ""}
                    onValueChange={(value) =>
                      form.setValue(`filaments.${index}.filamentId`, value ?? "")
                    }
                  >
                    <SelectTrigger className="w-full">
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
                </div>
                <Input
                  type="number"
                  step="any"
                  placeholder="g"
                  className="w-24"
                  {...form.register(`filaments.${index}.grams` as const, {
                    valueAsNumber: true,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => append({ filamentId: "", grams: undefined })}
            >
              <PlusIcon />
              Adicionar filamento
            </Button>
          </div>
        </FieldContent>
      </Field>

      <Field
        data-invalid={
          !!form.formState.errors.durationHours ||
          !!form.formState.errors.durationMinutes
        }
      >
        <FieldLabel htmlFor="print-duration-hours">
          <FieldIcon icon={ClockIcon} color="chart-3" />
          Tempo de impressão
        </FieldLabel>
        <FieldContent>
          <div className="flex items-center gap-2">
            <Input
              id="print-duration-hours"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              className="w-20"
              {...form.register("durationHours", { valueAsNumber: true })}
            />
            <span className="text-sm text-muted-foreground">h</span>
            <Input
              id="print-duration-minutes"
              type="number"
              step="1"
              min="0"
              max="59"
              placeholder="0"
              className="w-20"
              {...form.register("durationMinutes", { valueAsNumber: true })}
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
          <FieldError
            errors={[
              form.formState.errors.durationHours,
              form.formState.errors.durationMinutes,
            ]}
          />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.printLink}>
        <FieldLabel htmlFor="print-link">
          <FieldIcon icon={LinkIcon} color="chart-2" />
          Link da impressão
        </FieldLabel>
        <FieldContent>
          <Input
            id="print-link"
            type="url"
            placeholder="Ex: https://www.thingiverse.com/thing/..."
            {...form.register("printLink")}
          />
          <FieldError errors={[form.formState.errors.printLink]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <FieldIcon icon={ImageIcon} color="chart-5" />
          Foto
        </FieldLabel>
        <FieldContent>
          <PrintPhotoPicker
            file={photoFile}
            onFileChange={onPhotoFileChange}
            existingPhotoUrl={existingPhotoUrl}
          />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
