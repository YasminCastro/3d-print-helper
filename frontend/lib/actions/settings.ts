"use server";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { settingsFormSchema, type SettingsFormInput } from "@/lib/schemas/settings";

export async function updateSettingsAction(values: SettingsFormInput) {
  const parsed = settingsFormSchema.parse(values);

  db.prepare(
    "UPDATE app_settings SET default_profit_percent = ? WHERE id = 1"
  ).run(parsed.defaultProfitPercent);

  refresh();
}
