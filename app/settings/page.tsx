import { db } from "@/lib/db";
import { SettingsForm } from "@/components/settings-form";
import type { AppSettings } from "@/lib/types/settings";

export default function SettingsPage() {
  const settings = db
    .prepare("SELECT * FROM app_settings WHERE id = 1")
    .get() as AppSettings;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Configurações</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
