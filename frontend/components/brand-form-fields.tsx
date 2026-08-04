"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  CheckCircle2Icon,
  InfoIcon,
  LayersIcon,
  NotebookTextIcon,
  PackageIcon,
  PaletteIcon,
  PaintbrushIcon,
  StoreIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FieldIcon } from "@/components/field-icon";
import {
  costBenefitOptions,
  filamentTypeOptions,
  type BrandFormInput,
} from "@/lib/schemas/brand";
import {
  filamentTypeColors,
  filamentTypeLabels,
} from "@/lib/filament-type-labels";

export { filamentTypeColors, filamentTypeLabels };

export const costBenefitLabels: Record<
  (typeof costBenefitOptions)[number],
  string
> = {
  baixo: "Baixo",
  moderado: "Moderado",
  bom: "Bom",
  otimo: "Ótimo",
};

export function BrandFormFields({
  form,
}: {
  form: UseFormReturn<BrandFormInput>;
}) {
  return (
    <FieldGroup>
      <div className="flex gap-4">
        <Field className="flex-2" data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="brand-name">
            <FieldIcon icon={PackageIcon} color="chart-1" />
            Nome
          </FieldLabel>
          <FieldContent>
            <Input
              id="brand-name"
              placeholder="Ex: Voolt3D"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field className="flex-1" data-invalid={!!form.formState.errors.color}>
          <FieldLabel htmlFor="brand-color">
            <FieldIcon icon={PaintbrushIcon} color="chart-5" />
            Cor da marca
          </FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="brand-color"
                type="color"
                className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                value={form.watch("color") || "#6366f1"}
                onChange={(event) => form.setValue("color", event.target.value)}
              />
              <Input placeholder="#6366f1" {...form.register("color")} />
            </div>
            <FieldError errors={[form.formState.errors.color]} />
          </FieldContent>
        </Field>
      </div>

      <div className="flex gap-4">
        <Field
          className="flex-2"
          data-invalid={!!form.formState.errors.whereToBuy}
        >
          <FieldLabel htmlFor="brand-where">
            <FieldIcon icon={StoreIcon} color="chart-2" />
            Onde compra
          </FieldLabel>
          <FieldContent>
            <Input
              id="brand-where"
              placeholder="Ex: Mercado Livre, site próprio"
              {...form.register("whereToBuy")}
            />
            <FieldError errors={[form.formState.errors.whereToBuy]} />
          </FieldContent>
        </Field>

        <Field className="flex-1">
          <FieldLabel aria-hidden className="invisible">
            Espaçador
          </FieldLabel>
          <FieldContent>
            <label
              htmlFor="brand-purchased"
              className="flex h-9 items-center gap-2 text-sm"
            >
              <Checkbox
                id="brand-purchased"
                className="border-2 border-muted-foreground"
                checked={form.watch("purchased") ?? false}
                onCheckedChange={(checked) =>
                  form.setValue("purchased", checked === true)
                }
              />
              <FieldIcon
                icon={CheckCircle2Icon}
                color={form.watch("purchased") ? "green" : "gray"}
              />
              Já comprei
            </label>
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.avgPriceMin}>
          <FieldLabel htmlFor="brand-price-min">
            <FieldIcon icon={WalletIcon} color="chart-4" />
            Preço mínimo (R$)
            <Tooltip>
              <TooltipTrigger
                render={<InfoIcon className="size-3.5 text-muted-foreground" />}
              />
              <TooltipContent>
                Deixe em branco para usar o menor preço já pago entre os
                filamentos dessa marca.
              </TooltipContent>
            </Tooltip>
          </FieldLabel>
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
          <FieldLabel htmlFor="brand-price-max">
            <FieldIcon icon={WalletIcon} color="chart-4" />
            Preço máximo (R$)
            <Tooltip>
              <TooltipTrigger
                render={<InfoIcon className="size-3.5 text-muted-foreground" />}
              />
              <TooltipContent>
                Deixe em branco para usar o maior preço já pago entre os
                filamentos dessa marca.
              </TooltipContent>
            </Tooltip>
          </FieldLabel>
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
        <FieldLabel>
          <FieldIcon icon={LayersIcon} color="chart-3" />
          Tipos de filamento
        </FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(() => {
              const selected = form.watch("filamentTypes") ?? [];
              const legacyOptions = selected.filter(
                (value) =>
                  !(filamentTypeOptions as readonly string[]).includes(value),
              );
              const allOptions = [...filamentTypeOptions, ...legacyOptions];

              return allOptions.map((option) => {
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
                            : current.filter((value) => value !== option),
                        );
                      }}
                    />
                    {filamentTypeLabels[
                      option as (typeof filamentTypeOptions)[number]
                    ] ?? option}
                  </label>
                );
              });
            })()}
          </div>
          <FieldError errors={[form.formState.errors.filamentTypes]} />
        </FieldContent>
      </Field>

      <BestColorsField form={form} />

      <Field data-invalid={!!form.formState.errors.notes}>
        <FieldLabel htmlFor="brand-notes">
          <FieldIcon icon={NotebookTextIcon} color="chart-1" />
          Notas
        </FieldLabel>
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
      <FieldLabel htmlFor="brand-best-colors">
        <FieldIcon icon={PaletteIcon} color="chart-5" />
        Melhores cores
      </FieldLabel>
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
          <div className="mt-2 flex flex-wrap gap-1">
            {colors.map((color) => (
              <Badge
                key={color}
                variant="secondary"
                className="h-7 gap-1.5 px-3 text-sm"
              >
                {color}
                <button
                  type="button"
                  onClick={() =>
                    form.setValue(
                      "bestColors",
                      colors.filter((value) => value !== color),
                    )
                  }
                  aria-label={`Remover ${color}`}
                >
                  <XIcon className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <FieldError errors={[form.formState.errors.bestColors]} />
      </FieldContent>
    </Field>
  );
}
