"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  ClockIcon,
  LayersIcon,
  LinkIcon,
  NotebookTextIcon,
  PercentIcon,
  Printer as PrinterIcon,
  PlusIcon,
  ShoppingBagIcon,
  TagIcon,
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
import { NEW_CATEGORY_VALUE } from "@/lib/schemas/print";
import type { PrintQueueFormInput } from "@/lib/schemas/print-queue";
import type { PrintCategory } from "@/lib/types/print-queue";
import { categoryDotColorClass } from "@/lib/category-colors";
import type { FilamentOption } from "@/lib/types/filament";
import type { ExtraItem } from "@/lib/types/extra-item";
import { filamentTypeLabels } from "@/components/brand-form-fields";
import type { filamentTypeOptions } from "@/lib/schemas/brand";
import { FieldIcon } from "@/components/field-icon";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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

type FilamentComboItem = { value: string; label: string };
type ExtraItemComboItem = { value: string; label: string };
type CategoryComboItem = { value: string; label: string };

export function PrintQueueFormFields({
  form,
  categoryOptions,
  filamentOptions,
  printerOptions,
  extraItemOptions,
}: {
  form: UseFormReturn<PrintQueueFormInput>;
  categoryOptions: PrintCategory[];
  filamentOptions: FilamentOption[];
  printerOptions: { id: number; name: string }[];
  extraItemOptions: ExtraItem[];
}) {
  const categoryId = form.watch("categoryId");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "filaments",
  });
  const {
    fields: extraItemFields,
    append: appendExtraItem,
    remove: removeExtraItem,
  } = useFieldArray({
    control: form.control,
    name: "extraItems",
  });

  const sortedFilamentOptions = [...filamentOptions].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );

  const filamentItems: FilamentComboItem[] = sortedFilamentOptions.map((filament) => ({
    value: String(filament.id),
    label: filamentOptionLabel(filament),
  }));

  const sortedExtraItemOptions = [...extraItemOptions].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );

  const extraItemItems: ExtraItemComboItem[] = sortedExtraItemOptions.map((extraItem) => ({
    value: String(extraItem.id),
    label: `${extraItem.name} - ${currencyFormatter.format(extraItem.cost)}`,
  }));

  const sortedCategoryOptions = [...categoryOptions].sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );

  const categoryItems: CategoryComboItem[] = [
    ...sortedCategoryOptions.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
    { value: NEW_CATEGORY_VALUE, label: "+ Criar nova categoria" },
  ];

  return (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="print-queue-name">
          <FieldIcon icon={TypeIcon} color="chart-1" />
          Nome
        </FieldLabel>
        <FieldContent>
          <Input
            id="print-queue-name"
            placeholder="Ex: Suporte de celular"
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.categoryId}>
        <FieldLabel htmlFor="print-queue-category">
          <FieldIcon icon={TagIcon} color="chart-2" />
          Categoria
        </FieldLabel>
        <FieldContent>
          <Combobox
            items={categoryItems}
            value={categoryItems.find((item) => item.value === categoryId) ?? null}
            onValueChange={(item) => {
              const value = (item as CategoryComboItem | null)?.value ?? "";
              form.setValue("categoryId", value);
              if (value !== NEW_CATEGORY_VALUE) form.setValue("newCategoryName", "");
            }}
          >
            <ComboboxInputGroup>
              <ComboboxInput id="print-queue-category" placeholder="Pesquisar categoria..." />
              <ComboboxClear aria-label="Limpar seleção" />
              <ComboboxTrigger aria-label="Abrir lista" />
            </ComboboxInputGroup>
            <ComboboxContent>
              <ComboboxEmpty>Nenhuma categoria encontrada.</ComboboxEmpty>
              <ComboboxList>
                {(item: CategoryComboItem) =>
                  item.value === NEW_CATEGORY_VALUE ? (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  ) : (
                    <ComboboxItem key={item.value} value={item}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${categoryDotColorClass(item.label)}`}
                        />
                        {item.label}
                      </span>
                    </ComboboxItem>
                  )
                }
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
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
        <Field data-invalid={!!form.formState.errors.profitPercent}>
          <FieldLabel htmlFor="print-queue-profit-percent">
            <FieldIcon icon={PercentIcon} color="chart-4" />
            Lucro (%)
          </FieldLabel>
          <FieldContent>
            <Input
              id="print-queue-profit-percent"
              type="number"
              step="any"
              placeholder="100"
              {...form.register("profitPercent", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.profitPercent]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.printerId}>
          <FieldLabel htmlFor="print-queue-printer">
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
              <SelectTrigger id="print-queue-printer" className="w-full">
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
      </div>

      <Field
        data-invalid={
          !!form.formState.errors.durationHours || !!form.formState.errors.durationMinutes
        }
      >
        <FieldLabel htmlFor="print-queue-duration-hours">
          <FieldIcon icon={ClockIcon} color="chart-3" />
          Tempo de impressão
        </FieldLabel>
        <FieldContent>
          <div className="flex items-center gap-2">
            <Input
              id="print-queue-duration-hours"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              className="w-20"
              {...form.register("durationHours", { valueAsNumber: true })}
            />
            <span className="text-sm text-muted-foreground">h</span>
            <Input
              id="print-queue-duration-minutes"
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
            errors={[form.formState.errors.durationHours, form.formState.errors.durationMinutes]}
          />
        </FieldContent>
      </Field>

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
                  <Combobox
                    items={filamentItems}
                    value={
                      filamentItems.find(
                        (item) => item.value === form.watch(`filaments.${index}.filamentId`)
                      ) ?? null
                    }
                    onValueChange={(item) =>
                      form.setValue(
                        `filaments.${index}.filamentId`,
                        (item as FilamentComboItem | null)?.value ?? ""
                      )
                    }
                  >
                    <ComboboxInputGroup>
                      <ComboboxInput placeholder="Pesquisar filamento..." />
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
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
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

      <Field>
        <FieldLabel>
          <FieldIcon icon={ShoppingBagIcon} color="chart-4" />
          Itens extras
        </FieldLabel>
        <FieldContent>
          <div className="flex flex-col gap-2">
            {extraItemFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Combobox
                    items={extraItemItems}
                    value={
                      extraItemItems.find(
                        (item) => item.value === form.watch(`extraItems.${index}.extraItemId`)
                      ) ?? null
                    }
                    onValueChange={(item) =>
                      form.setValue(
                        `extraItems.${index}.extraItemId`,
                        (item as ExtraItemComboItem | null)?.value ?? ""
                      )
                    }
                  >
                    <ComboboxInputGroup>
                      <ComboboxInput placeholder="Pesquisar item extra..." />
                      <ComboboxClear aria-label="Limpar seleção" />
                      <ComboboxTrigger aria-label="Abrir lista" />
                    </ComboboxInputGroup>
                    <ComboboxContent>
                      <ComboboxEmpty>Nenhum item extra encontrado.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: ExtraItemComboItem) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <Input
                  type="number"
                  step="any"
                  placeholder="qtd"
                  className="w-24"
                  {...form.register(`extraItems.${index}.quantity` as const, {
                    valueAsNumber: true,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeExtraItem(index)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => appendExtraItem({ extraItemId: "", quantity: 1 })}
            >
              <PlusIcon />
              Adicionar item extra
            </Button>
          </div>
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.printLink}>
        <FieldLabel htmlFor="print-queue-link">
          <FieldIcon icon={LinkIcon} color="chart-2" />
          Link da impressão
        </FieldLabel>
        <FieldContent>
          <Input
            id="print-queue-link"
            type="url"
            placeholder="Ex: https://www.thingiverse.com/thing/..."
            {...form.register("printLink")}
          />
          <FieldError errors={[form.formState.errors.printLink]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.notes}>
        <FieldLabel htmlFor="print-queue-notes">
          <FieldIcon icon={NotebookTextIcon} color="chart-3" />
          Notas
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="print-queue-notes"
            placeholder="Qualquer observação sobre a impressão..."
            {...form.register("notes")}
          />
          <FieldError errors={[form.formState.errors.notes]} />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
