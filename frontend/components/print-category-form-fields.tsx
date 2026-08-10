"use client";

import type { UseFormReturn } from "react-hook-form";
import { PaintbrushIcon, TagIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FieldIcon } from "@/components/field-icon";
import type { PrintCategoryFormInput } from "@/lib/schemas/print-category";

export function PrintCategoryFormFields({
  form,
}: {
  form: UseFormReturn<PrintCategoryFormInput>;
}) {
  return (
    <FieldGroup>
      <div className="flex gap-4">
        <Field className="flex-2" data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="print-category-name">
            <FieldIcon icon={TagIcon} color="chart-1" />
            Nome
          </FieldLabel>
          <FieldContent>
            <Input
              id="print-category-name"
              placeholder="Ex: Miniaturas"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </FieldContent>
        </Field>

        <Field className="flex-1" data-invalid={!!form.formState.errors.color}>
          <FieldLabel htmlFor="print-category-color">
            <FieldIcon icon={PaintbrushIcon} color="chart-5" />
            Cor
          </FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-2">
              <input
                id="print-category-color"
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
    </FieldGroup>
  );
}
