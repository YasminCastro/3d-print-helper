"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Building2Icon,
  CalendarIcon,
  CircleCheckIcon,
  LayersIcon,
  LinkIcon,
  PaletteIcon,
  StarIcon,
  TagIcon,
  ThermometerIcon,
  WalletIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import { FieldIcon } from "@/components/field-icon";
import { availabilityOptions, type FilamentFormInput } from "@/lib/schemas/filament";
import { filamentTypeOptions } from "@/lib/schemas/brand";
import { filamentTypeLabels } from "@/components/brand-form-fields";

export const availabilityLabels: Record<(typeof availabilityOptions)[number], string> = {
  disponivel: "Disponível",
  indisponivel: "Indisponível",
  quase_acabando: "Quase acabando",
};

export const availabilityColors: Record<(typeof availabilityOptions)[number], string> = {
  disponivel: "text-green-600 dark:text-green-400",
  indisponivel: "text-red-600 dark:text-red-400",
  quase_acabando: "text-yellow-600 dark:text-yellow-400",
};

export function FilamentFormFields({
  form,
  brandOptions,
}: {
  form: UseFormReturn<FilamentFormInput>;
  brandOptions: { id: number; name: string }[];
}) {
  const isDuoColor = form.watch("material") === "pla_duo_color";

  return (
    <FieldGroup>
      <div className="flex items-center justify-between gap-4">
        <StarRatingField form={form} />

        <Field className="w-fit" data-invalid={!!form.formState.errors.availability}>
          <FieldLabel htmlFor="filament-availability">
            <FieldIcon icon={CircleCheckIcon} color="chart-2" />
            Disponibilidade
          </FieldLabel>
          <FieldContent>
            <Select
              items={availabilityOptions.map((option) => ({
                value: option,
                label: availabilityLabels[option],
              }))}
              value={form.watch("availability") ?? ""}
              onValueChange={(value) =>
                form.setValue("availability", value as FilamentFormInput["availability"])
              }
            >
              <SelectTrigger id="filament-availability" className="w-48">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {availabilityLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.availability]} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-4">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="filament-name">
            <FieldIcon icon={LayersIcon} color="chart-1" />
            Nome do filamento
          </FieldLabel>
          <FieldContent>
            <Input
              id="filament-name"
              placeholder="Ex: PLA Azul Bandeira"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.color || !!form.formState.errors.color2}>
          <FieldLabel htmlFor="filament-color">
            <FieldIcon icon={PaletteIcon} color="chart-1" />
            {isDuoColor ? "Cores" : "Cor"}
          </FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="filament-color"
                type="color"
                className="h-9 w-14 cursor-pointer rounded-md border border-input bg-transparent p-1"
                value={form.watch("color") || "#a1a1aa"}
                onChange={(event) => form.setValue("color", event.target.value)}
              />
              {isDuoColor && (
                <input
                  id="filament-color2"
                  type="color"
                  aria-label="Segunda cor"
                  className="h-9 w-14 cursor-pointer rounded-md border border-input bg-transparent p-1"
                  value={form.watch("color2") || "#a1a1aa"}
                  onChange={(event) => form.setValue("color2", event.target.value)}
                />
              )}
            </div>
            <FieldError errors={[form.formState.errors.color, form.formState.errors.color2]} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.lastPurchaseDate}>
          <FieldLabel htmlFor="filament-last-purchase-date">
            <FieldIcon icon={CalendarIcon} color="chart-3" />
            Data da última compra
          </FieldLabel>
          <FieldContent>
            <Input
              id="filament-last-purchase-date"
              type="date"
              {...form.register("lastPurchaseDate")}
            />
            <FieldError errors={[form.formState.errors.lastPurchaseDate]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.material}>
          <FieldLabel htmlFor="filament-material">
            <FieldIcon icon={LayersIcon} color="chart-1" />
            Material
          </FieldLabel>
          <FieldContent>
            <Select
              items={filamentTypeOptions.map((option) => ({
                value: option,
                label: filamentTypeLabels[option],
              }))}
              value={form.watch("material") ?? ""}
              onValueChange={(value) =>
                form.setValue(
                  "material",
                  value as FilamentFormInput["material"],
                )
              }
            >
              <SelectTrigger id="filament-material" className="w-full">
                <SelectValue placeholder="Selecione o material" />
              </SelectTrigger>
              <SelectContent>
                {filamentTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {filamentTypeLabels[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.material]} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.brandId}>
          <FieldLabel htmlFor="filament-brand">
            <FieldIcon icon={Building2Icon} color="chart-2" />
            Marca
          </FieldLabel>
          <FieldContent>
            <Select
              items={brandOptions.map((brand) => ({
                value: String(brand.id),
                label: brand.name,
              }))}
              value={form.watch("brandId") ?? ""}
              onValueChange={(value) => form.setValue("brandId", value ?? "")}
            >
              <SelectTrigger id="filament-brand" className="w-full">
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {brandOptions.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.brandId]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.saleName}>
          <FieldLabel htmlFor="filament-sale-name">
            <FieldIcon icon={TagIcon} color="chart-1" />
            Nome de venda
          </FieldLabel>
          <FieldContent>
            <Input
              id="filament-sale-name"
              placeholder="Ex: PLA Premium"
              {...form.register("saleName")}
            />
            <FieldError errors={[form.formState.errors.saleName]} />
          </FieldContent>
        </Field>
      </div>

      <Field data-invalid={!!form.formState.errors.purchaseLink}>
        <FieldLabel htmlFor="filament-purchase-link">
          <FieldIcon icon={LinkIcon} color="chart-2" />
          Link de compra
        </FieldLabel>
        <FieldContent>
          <Input
            id="filament-purchase-link"
            type="url"
            placeholder="https://..."
            {...form.register("purchaseLink")}
          />
          <FieldError errors={[form.formState.errors.purchaseLink]} />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.minPricePaid}>
          <FieldLabel htmlFor="filament-price-min">
            <FieldIcon icon={WalletIcon} color="chart-4" />
            Preço mínimo pago (R$)
          </FieldLabel>
          <FieldContent>
            <Input
              id="filament-price-min"
              type="number"
              step="any"
              placeholder="Ex: 89"
              {...form.register("minPricePaid", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.minPricePaid]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.maxPricePaid}>
          <FieldLabel htmlFor="filament-price-max">
            <FieldIcon icon={WalletIcon} color="chart-4" />
            Preço máximo pago (R$)
          </FieldLabel>
          <FieldContent>
            <Input
              id="filament-price-max"
              type="number"
              step="any"
              placeholder="Ex: 120"
              {...form.register("maxPricePaid", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.maxPricePaid]} />
          </FieldContent>
        </Field>
      </div>

      <FieldSeparator>Recomendações do fabricante</FieldSeparator>

      <Field>
        <FieldLabel>
          <FieldIcon icon={ThermometerIcon} color="chart-3" />
          Bico (°C)
        </FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel
                htmlFor="filament-nozzle-min"
                className="font-normal text-muted-foreground"
              >
                Mínima
              </FieldLabel>
              <Input
                id="filament-nozzle-min"
                type="number"
                placeholder="Ex: 190"
                {...form.register("nozzleTempMin", { valueAsNumber: true })}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="filament-nozzle-max"
                className="font-normal text-muted-foreground"
              >
                Máxima
              </FieldLabel>
              <Input
                id="filament-nozzle-max"
                type="number"
                placeholder="Ex: 220"
                {...form.register("nozzleTempMax", { valueAsNumber: true })}
              />
            </div>
          </div>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <FieldIcon icon={ThermometerIcon} color="chart-5" />
          Mesa (°C)
        </FieldLabel>
        <FieldContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel
                htmlFor="filament-bed-min"
                className="font-normal text-muted-foreground"
              >
                Mínima
              </FieldLabel>
              <Input
                id="filament-bed-min"
                type="number"
                placeholder="Ex: 50"
                {...form.register("bedTempMin", { valueAsNumber: true })}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="filament-bed-max"
                className="font-normal text-muted-foreground"
              >
                Máxima
              </FieldLabel>
              <Input
                id="filament-bed-max"
                type="number"
                placeholder="Ex: 60"
                {...form.register("bedTempMax", { valueAsNumber: true })}
              />
            </div>
          </div>
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}

function StarRatingField({ form }: { form: UseFormReturn<FilamentFormInput> }) {
  const rating = form.watch("rating");

  return (
    <Field data-invalid={!!form.formState.errors.rating}>
      <FieldLabel>
        <FieldIcon icon={StarIcon} color="chart-1" />
        Nota
      </FieldLabel>
      <FieldContent>
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4, 5] as const).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                form.setValue("rating", rating === star ? undefined : star)
              }
              aria-label={`Nota ${star}`}
            >
              <StarIcon
                className={cn(
                  "size-5",
                  rating != null && star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        <FieldError errors={[form.formState.errors.rating]} />
      </FieldContent>
    </Field>
  );
}
