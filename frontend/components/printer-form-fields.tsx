"use client";

import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  ClockIcon,
  PaintbrushIcon,
  PlugZapIcon,
  Printer as PrinterIcon,
  TagIcon,
  WalletIcon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { FieldIcon } from "@/components/field-icon";
import type { PrinterFormInput } from "@/lib/schemas/printer";

function calculateMaintenanceCost(price: number, lifespanHours: number) {
  return Math.round((price / lifespanHours) * 100) / 100;
}

export function PrinterFormFields({
  form,
}: {
  form: UseFormReturn<PrinterFormInput>;
}) {
  const isMaintenanceAuto = useRef(form.getValues("maintenanceCostPerHour") == null);

  const purchasePrice = form.watch("purchasePrice");
  const lifespanHours = form.watch("lifespanHours");
  const maintenanceField = form.register("maintenanceCostPerHour", {
    valueAsNumber: true,
  });

  useEffect(() => {
    if (!isMaintenanceAuto.current) return;
    if (
      purchasePrice == null ||
      lifespanHours == null ||
      Number.isNaN(purchasePrice) ||
      Number.isNaN(lifespanHours) ||
      lifespanHours <= 0
    ) {
      return;
    }

    form.setValue(
      "maintenanceCostPerHour",
      calculateMaintenanceCost(purchasePrice, lifespanHours)
    );
  }, [purchasePrice, lifespanHours, form]);

  return (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="printer-name">
          <FieldIcon icon={PrinterIcon} color="chart-1" />
          Nome
        </FieldLabel>
        <FieldContent>
          <Input
            id="printer-name"
            placeholder="Ex: Ender 3 V2"
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.brand}>
        <FieldLabel htmlFor="printer-brand">
          <FieldIcon icon={TagIcon} color="chart-1" />
          Marca
        </FieldLabel>
        <FieldContent>
          <Input
            id="printer-brand"
            placeholder="Ex: Creality"
            {...form.register("brand")}
          />
          <FieldError errors={[form.formState.errors.brand]} />
        </FieldContent>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.powerConsumptionW}>
          <FieldLabel htmlFor="printer-power">
            <FieldIcon icon={ZapIcon} color="chart-2" />
            Consumo (W)
          </FieldLabel>
          <FieldContent>
            <Input
              id="printer-power"
              type="number"
              step="any"
              placeholder="Ex: 350"
              {...form.register("powerConsumptionW", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.powerConsumptionW]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.lifespanHours}>
          <FieldLabel htmlFor="printer-lifespan">
            <FieldIcon icon={ClockIcon} color="chart-3" />
            Vida útil (h)
          </FieldLabel>
          <FieldContent>
            <Input
              id="printer-lifespan"
              type="number"
              step="any"
              placeholder="Ex: 8000"
              {...form.register("lifespanHours", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.lifespanHours]} />
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!form.formState.errors.purchasePrice}>
          <FieldLabel htmlFor="printer-price">
            <FieldIcon icon={WalletIcon} color="chart-4" />
            Preço pago (R$)
          </FieldLabel>
          <FieldContent>
            <Input
              id="printer-price"
              type="number"
              step="any"
              placeholder="Ex: 1800"
              {...form.register("purchasePrice", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.purchasePrice]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.energyCostPerKwh}>
          <FieldLabel htmlFor="printer-kwh-price">
            <FieldIcon icon={PlugZapIcon} color="chart-5" />
            Preço do kWh (R$)
          </FieldLabel>
          <FieldContent>
            <Input
              id="printer-kwh-price"
              type="number"
              step="any"
              placeholder="Ex: 0.95"
              {...form.register("energyCostPerKwh", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.energyCostPerKwh]} />
          </FieldContent>
        </Field>
      </div>

      <Field data-invalid={!!form.formState.errors.maintenanceCostPerHour}>
        <FieldLabel htmlFor="printer-maintenance">
          <FieldIcon icon={WrenchIcon} color="chart-1" />
          Manutenção (R$/h)
        </FieldLabel>
        <FieldContent>
          <Input
            id="printer-maintenance"
            type="number"
            step="any"
            placeholder="Calculado automaticamente"
            {...maintenanceField}
            onChange={(event) => {
              isMaintenanceAuto.current = event.target.value === "";
              maintenanceField.onChange(event);
            }}
          />
          <FieldDescription>
            Calculado como preço ÷ vida útil. Pode ser sobrescrito.
          </FieldDescription>
          <FieldError errors={[form.formState.errors.maintenanceCostPerHour]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.color}>
        <FieldLabel htmlFor="printer-color">
          <FieldIcon icon={PaintbrushIcon} color="chart-5" />
          Cor da impressora
        </FieldLabel>
        <FieldContent>
          <div className="flex items-center gap-2">
            <input
              id="printer-color"
              type="color"
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
              value={form.watch("color") || "#6366f1"}
              onChange={(event) => form.setValue("color", event.target.value)}
            />
            <Input
              placeholder="#6366f1"
              className="max-w-32"
              {...form.register("color")}
            />
            {form.watch("color") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => form.setValue("color", "")}
              >
                Limpar
              </Button>
            )}
          </div>
          <FieldDescription>
            Usada para colorir o ícone da impressora. Se não for definida, uma cor aleatória é
            usada.
          </FieldDescription>
          <FieldError errors={[form.formState.errors.color]} />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
