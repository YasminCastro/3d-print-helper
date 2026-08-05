export type Filament = {
  id: number;
  name: string;
  availability: string | null;
  last_purchase_date: string | null;
  material: string | null;
  brand_id: number | null;
  purchase_link: string | null;
  sale_name: string | null;
  min_price_paid: number | null;
  max_price_paid: number | null;
  nozzle_temp_min: number | null;
  nozzle_temp_max: number | null;
  bed_temp_min: number | null;
  bed_temp_max: number | null;
  rating: number | null;
  color: string | null;
  color2: string | null;
  created_at: string;
};

export type FilamentWithBrand = Filament & { brand_name: string | null };

export type FilamentOption = {
  id: number;
  name: string;
  color: string | null;
  color2: string | null;
  material: string | null;
  brand_name: string | null;
};
