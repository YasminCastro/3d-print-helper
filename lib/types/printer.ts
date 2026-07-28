export type Printer = {
  id: number;
  name: string;
  model: string | null;
  brand: string | null;
  power_consumption_w: number | null;
  maintenance_cost_per_hour: number | null;
  purchase_price: number | null;
  lifespan_hours: number | null;
  energy_cost_per_kwh: number | null;
  created_at: string;
};
