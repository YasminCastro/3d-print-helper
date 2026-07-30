"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateSettingsAction } from "@/lib/actions/settings";
import {
  settingsFormSchema,
  type SettingsFormInput,
} from "@/lib/schemas/settings";
import type { AppSettings } from "@/lib/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      defaultProfitPercent: settings.default_profit_percent,
    },
  });

  function onSubmit(values: SettingsFormInput) {
    startTransition(async () => {
      await updateSettingsAction(values);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Impressões</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.defaultProfitPercent}>
              <FieldLabel htmlFor="default-profit-percent">
                Lucro padrão (%)
              </FieldLabel>
              <FieldContent>
                <Input
                  id="default-profit-percent"
                  type="number"
                  step="any"
                  className="max-w-40"
                  {...form.register("defaultProfitPercent", {
                    valueAsNumber: true,
                  })}
                />
                <FieldError
                  errors={[form.formState.errors.defaultProfitPercent]}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
