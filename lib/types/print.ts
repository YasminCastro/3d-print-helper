export type PrintCategory = {
  id: number;
  name: string;
  created_at: string;
};

export type Print = {
  id: number;
  name: string;
  photo_filename: string | null;
  print_date: string | null;
  duration_minutes: number | null;
  status: string | null;
  result: string | null;
  category_id: number | null;
  printer_id: number | null;
  print_link: string | null;
  profit_percent: number | null;
  created_at: string;
};

export type PrintFilament = {
  id: number;
  print_id: number;
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
