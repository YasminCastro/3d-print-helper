import type { PrintCategory } from "@/lib/types/print";

export type PrintQueueItem = {
  id: number;
  name: string;
  duration_minutes: number | null;
  category_id: number | null;
  printer_id: number | null;
  print_link: string | null;
  notes: string | null;
  profit_percent: number | null;
  filament_cost: number | null;
  print_cost: number | null;
  sale_value: number | null;
  sale_value_worst_case: number | null;
  created_at: string;
};

export type PrintQueueFilament = {
  filament_id: number | null;
  grams: number | null;
  position: number;
};

export type PrintQueueFilamentWithDetails = PrintQueueFilament & {
  filament_name: string | null;
  filament_color: string | null;
  filament_color2: string | null;
  filament_material: string | null;
  filament_min_price_paid: number | null;
  filament_max_price_paid: number | null;
};

export type PrintQueueExtraItem = {
  extra_item_id: number | null;
  quantity: number | null;
  position: number;
};

export type PrintQueueExtraItemWithDetails = PrintQueueExtraItem & {
  extra_item_name: string | null;
  extra_item_cost: number | null;
};

export type PrintQueueItemWithFilaments = PrintQueueItem & {
  filaments: PrintQueueFilament[];
  extraItems: PrintQueueExtraItem[];
};

export type PrintQueueItemWithCategory = PrintQueueItem & {
  category_name: string | null;
  printer_name: string | null;
  printer_power_consumption_w: number | null;
  printer_energy_cost_per_kwh: number | null;
  printer_maintenance_cost_per_hour: number | null;
};

export type PrintQueueItemWithDetails = PrintQueueItemWithCategory & {
  filaments: PrintQueueFilamentWithDetails[];
  extraItems: PrintQueueExtraItemWithDetails[];
};

export type { PrintCategory };
