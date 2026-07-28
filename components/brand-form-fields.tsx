"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  costBenefitOptions,
  filamentTypeOptions,
  type BrandFormInput,
} from "@/lib/schemas/brand";

export const costBenefitLabels: Record<(typeof costBenefitOptions)[number], string> = {
  baixo: "Baixo",
  moderado: "Moderado",
  bom: "Bom",
  otimo: "Ótimo",
};

export const filamentTypeLabels: Record<(typeof filamentTypeOptions)[number], string> = {
  pla: "PLA",
  pla_matte: "PLA Matte",
  pla_silk: "PLA Silk",
  pla_duo_color: "PLA Duo Color",
  pla_tri_color: "PLA Tri Color",
  petg: "PETG",
  abs: "ABS",
  asa: "ASA",
  tpu: "TPU",
  nylon: "Nylon",
  pva: "PVA",
};

export const filamentTypeColors: Record<(typeof filamentTypeOptions)[number], string> = {
  pla: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_matte:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_silk:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_duo_color:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pla_tri_color:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  petg: "border-teal-200 bg-teal-100 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  abs: "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  asa: "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  tpu: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  nylon:
    "border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300",
  pva: "border-lime-200 bg-lime-100 text-lime-700 dark:border-lime-900 dark:bg-lime-950 dark:text-lime-300",
};

export function BrandFormFields({
  form,
}: {
  form: UseFormReturn<BrandFormInput>;
}) {
  return (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="brand-name">Nome</FieldLabel>
        <FieldContent>
          <Input id="brand-name" placeholder="Ex: Voolt3D" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.whereToBuy}>
        <FieldLabel htmlFor="brand-where">Onde compra</FieldLabel>
        <FieldContent>
          <Input
            id="brand-where"
            placeholder="Ex: Mercado Livre, site próprio"
            {...form.register("whereToBuy")}
          />
          <FieldError errors={[form.formState.errors.whereToBuy]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldContent>
          <label htmlFor="brand-purchased" className="flex items-center gap-2 text-sm">
            <Checkbox
              id="brand-purchased"
              checked={form.watch("purchased") ?? false}
              onCheckedChange={(checked) => form.setValue("purchased", checked === true)}
            />
            Já comprei dessa marca
          </label>
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.avgPriceMin}>
          <FieldLabel htmlFor="brand-price-min">Preço médio mín. (R$)</FieldLabel>
          <FieldContent>
            <Input
              id="brand-price-min"
              type="number"
              step="any"
              placeholder="Ex: 99"
              {...form.register("avgPriceMin", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.avgPriceMin]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.avgPriceMax}>
          <FieldLabel htmlFor="brand-price-max">Preço médio máx. (R$)</FieldLabel>
          <FieldContent>
            <Input
              id="brand-price-max"
              type="number"
              step="any"
              placeholder="Ex: 170"
              {...form.register("avgPriceMax", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.avgPriceMax]} />
          </FieldContent>
        </Field>
      </div>

      <Field data-invalid={!!form.formState.errors.filamentTypes}>
        <FieldLabel>Tipos de filamento</FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filamentTypeOptions.map((option) => {
              const selected = form.watch("filamentTypes") ?? [];
              const checked = selected.includes(option);

              return (
                <label
                  key={option}
                  htmlFor={`brand-filament-type-${option}`}
                  className="group flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    id={`brand-filament-type-${option}`}
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      const current = form.getValues("filamentTypes") ?? [];
                      form.setValue(
                        "filamentTypes",
                        nextChecked
                          ? [...current, option]
                          : current.filter((value) => value !== option)
                      );
                    }}
                  />
                  {filamentTypeLabels[option]}
                </label>
              );
            })}
          </div>
          <FieldError errors={[form.formState.errors.filamentTypes]} />
        </FieldContent>
      </Field>

      <BestColorsField form={form} />

      <Field data-invalid={!!form.formState.errors.notes}>
        <FieldLabel htmlFor="brand-notes">Notas</FieldLabel>
        <FieldContent>
          <Textarea
            id="brand-notes"
            placeholder="Recomendações, problemas, avaliações..."
            {...form.register("notes")}
          />
          <FieldError errors={[form.formState.errors.notes]} />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}

function BestColorsField({ form }: { form: UseFormReturn<BrandFormInput> }) {
  const [colorInput, setColorInput] = useState("");
  const colors = form.watch("bestColors") ?? [];

  function addColor() {
    const value = colorInput.trim();
    if (!value || colors.includes(value)) {
      setColorInput("");
      return;
    }
    form.setValue("bestColors", [...colors, value]);
    setColorInput("");
  }

  return (
    <Field data-invalid={!!form.formState.errors.bestColors}>
      <FieldLabel htmlFor="brand-best-colors">Melhores cores</FieldLabel>
      <FieldContent>
        <div className="flex gap-2">
          <Input
            id="brand-best-colors"
            placeholder="Ex: Azul bandeira"
            value={colorInput}
            onChange={(event) => setColorInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addColor();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addColor}>
            Adicionar
          </Button>
        </div>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {colors.map((color) => (
              <Badge key={color} variant="secondary" className="gap-1">
                {color}
                <button
                  type="button"
                  onClick={() =>
                    form.setValue(
                      "bestColors",
                      colors.filter((value) => value !== color)
                    )
                  }
                  aria-label={`Remover ${color}`}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <FieldDescription>
          Cores que você mais gostou ou recomenda dessa marca (se tiver).
        </FieldDescription>
        <FieldError errors={[form.formState.errors.bestColors]} />
      </FieldContent>
    </Field>
  );
}
