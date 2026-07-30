export type FilamentBrand = {
  id: number;
  name: string;
  where_to_buy: string | null;
  avg_price_min: number | null;
  avg_price_max: number | null;
  filament_types: string | null;
  best_colors: string | null;
  purchased: number | null;
  notes: string | null;
  created_at: string;
};
