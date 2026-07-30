export type Calibration = {
  id: number;
  slicer: string;
  filament_id: number | null;
  status: string | null;
  calibration_date: string | null;
  bed_temp_first_layer: number | null;
  bed_temp_other_layers: number | null;
  nozzle_temp_initial: number | null;
  nozzle_temp_final: number | null;
  max_volumetric_speed: number | null;
  pressure_advance: number | null;
  flow_ratio: number | null;
  retraction_distance: number | null;
  notes: string | null;
  created_at: string;
};

export type CalibrationWithFilament = Calibration & {
  filament_name: string | null;
  filament_color: string | null;
};
