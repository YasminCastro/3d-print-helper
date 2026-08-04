import type { Filament } from "@/lib/types/filament";

export function filamentDenormalizedFields(filament: Filament | null | undefined) {
  return {
    filament_name: filament?.name ?? null,
    filament_color: filament?.color ?? null,
    filament_color2: filament?.color2 ?? null,
    filament_material: filament?.material ?? null,
    filament_min_price_paid: filament?.min_price_paid ?? null,
    filament_max_price_paid: filament?.max_price_paid ?? null,
  };
}
