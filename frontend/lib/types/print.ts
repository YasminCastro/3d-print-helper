export type PrintCategory = {
  id: number;
  name: string;
  created_at: string;
};

export type Print = {
  id: number;
  name: string;
  photo_filename: string | null;
  photo_mime_type: string | null;
  print_date: string | null;
  duration_minutes: number | null;
  status: string | null;
  result: string | null;
  category_id: number | null;
  printer_id: number | null;
  print_link: string | null;
  profit_percent: number | null;
  filament_cost: number | null;
  print_cost: number | null;
  sale_value: number | null;
  sale_value_worst_case: number | null;
  sale_value_actual: number | null;
  created_at: string;
};

export type PrintFilament = {
  filament_id: number | null;
  grams: number | null;
  position: number;
};

export type PrintFilamentWithDetails = PrintFilament & {
  filament_name: string | null;
  filament_color: string | null;
  filament_material: string | null;
  filament_min_price_paid: number | null;
  filament_max_price_paid: number | null;
};

export type PrintWithFilaments = Print & {
  filaments: PrintFilament[];
};

export type PrintWithCategory = Print & {
  category_name: string | null;
  printer_name: string | null;
  printer_power_consumption_w: number | null;
  printer_energy_cost_per_kwh: number | null;
  printer_maintenance_cost_per_hour: number | null;
};

export type PrintWithDetails = PrintWithCategory & {
  filaments: PrintFilamentWithDetails[];
};
