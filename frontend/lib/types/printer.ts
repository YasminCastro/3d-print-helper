export type Printer = {
  id: number;
  name: string;
  model: string | null;
  brand: string | null;
  powerConsumptionW: number | null;
  maintenanceCostPerHour: number | null;
  purchasePrice: number | null;
  lifespanHours: number | null;
  energyCostPerKwh: number | null;
  createdAt: string;
};
