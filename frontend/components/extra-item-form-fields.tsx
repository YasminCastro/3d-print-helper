"use client";

import type { UseFormReturn } from "react-hook-form";
import { CoinsIcon, ShoppingBagIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FieldIcon } from "@/components/field-icon";
import type { ExtraItemFormInput } from "@/lib/schemas/extra-item";

export function ExtraItemFormFields({
  form,
}: {
  form: UseFormReturn<ExtraItemFormInput>;
}) {
  return (
    <FieldGroup>
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="extra-item-name">
          <FieldIcon icon={ShoppingBagIcon} color="chart-1" />
          Nome
        </FieldLabel>
        <FieldContent>
          <Input
            id="extra-item-name"
            placeholder="Ex: Argola de chaveiro"
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field data-invalid={!!form.formState.errors.cost}>
        <FieldLabel htmlFor="extra-item-cost">
          <FieldIcon icon={CoinsIcon} color="chart-4" />
          Valor unitário (R$)
        </FieldLabel>
        <FieldContent>
          <Input
            id="extra-item-cost"
            type="number"
            step="any"
            placeholder="Ex: 0.35"
            {...form.register("cost", { valueAsNumber: true })}
          />
          <FieldError errors={[form.formState.errors.cost]} />
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
