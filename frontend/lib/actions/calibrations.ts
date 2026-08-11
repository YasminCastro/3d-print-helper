"use server";

import { refresh } from "next/cache";

import { backendFetch } from "@/lib/backend-fetch";
import { calibrationFormSchema, type CalibrationFormInput } from "@/lib/schemas/calibration";
import type { Calibration } from "@/lib/types/calibration";

type ApiCalibration = {
  id: number;
  slicer: string;
  filamentId: number | null;
  printerId: number | null;
  status: string | null;
  calibrationDate: string | null;
  bedTempFirstLayer: number | null;
  bedTempOtherLayers: number | null;
  nozzleTempInitial: number | null;
  nozzleTempFinal: number | null;
  maxVolumetricSpeed: number | null;
  pressureAdvance: number | null;
  flowRatio: number | null;
  retractionDistance: number | null;
  purchaseBatch: string | null;
  notes: string | null;
  createdAt: string;
};

function toDomain(api: ApiCalibration): Calibration {
  return {
    id: api.id,
    slicer: api.slicer,
    filament_id: api.filamentId,
    printer_id: api.printerId,
    status: api.status,
    calibration_date: api.calibrationDate,
    bed_temp_first_layer: api.bedTempFirstLayer,
    bed_temp_other_layers: api.bedTempOtherLayers,
    nozzle_temp_initial: api.nozzleTempInitial,
    nozzle_temp_final: api.nozzleTempFinal,
    max_volumetric_speed: api.maxVolumetricSpeed,
    pressure_advance: api.pressureAdvance,
    flow_ratio: api.flowRatio,
    retraction_distance: api.retractionDistance,
    purchase_batch: api.purchaseBatch,
    notes: api.notes,
    created_at: api.createdAt,
  };
}

function toPayload(values: CalibrationFormInput) {
  const parsed = calibrationFormSchema.parse(values);

  return {
    slicer: parsed.slicer,
    filamentId: Number(parsed.filamentId),
    printerId: parsed.printerId ? Number(parsed.printerId) : null,
    status: parsed.status ?? null,
    calibrationDate: parsed.calibrationDate || null,
    bedTempFirstLayer: parsed.bedTempFirstLayer ?? null,
    bedTempOtherLayers: parsed.bedTempOtherLayers ?? null,
    nozzleTempInitial: parsed.nozzleTempInitial ?? null,
    nozzleTempFinal: parsed.nozzleTempFinal ?? null,
    maxVolumetricSpeed: parsed.maxVolumetricSpeed ?? null,
    pressureAdvance: parsed.pressureAdvance ?? null,
    flowRatio: parsed.flowRatio ?? null,
    retractionDistance: parsed.retractionDistance ?? null,
    purchaseBatch: parsed.purchaseBatch || null,
    notes: parsed.notes || null,
  };
}

export async function getCalibrations(): Promise<Calibration[]> {
  const response = await backendFetch("/calibrations", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar as calibrações");
  }
  const body = await response.json();
  return (body.data as ApiCalibration[]).map(toDomain);
}

export async function getCalibration(id: number): Promise<Calibration | null> {
  const response = await backendFetch(`/calibrations/${id}`, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar a calibração");
  }
  const body = await response.json();
  return toDomain(body.data);
}

export async function createCalibrationAction(values: CalibrationFormInput) {
  const response = await backendFetch("/calibrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a calibração");
  }

  refresh();
}

export async function updateCalibrationAction(id: number, values: CalibrationFormInput) {
  const response = await backendFetch(`/calibrations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a calibração");
  }

  refresh();
}

export async function cloneCalibrationAction(id: number): Promise<Calibration> {
  const source = await getCalibration(id);
  if (!source) {
    throw new Error("Calibração não encontrada");
  }

  const response = await backendFetch("/calibrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slicer: source.slicer,
      filamentId: source.filament_id,
      printerId: source.printer_id,
      status: source.status,
      calibrationDate: source.calibration_date,
      bedTempFirstLayer: source.bed_temp_first_layer,
      bedTempOtherLayers: source.bed_temp_other_layers,
      nozzleTempInitial: source.nozzle_temp_initial,
      nozzleTempFinal: source.nozzle_temp_final,
      maxVolumetricSpeed: source.max_volumetric_speed,
      pressureAdvance: source.pressure_advance,
      flowRatio: source.flow_ratio,
      retractionDistance: source.retraction_distance,
      purchaseBatch: source.purchase_batch,
      notes: source.notes,
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível clonar a calibração");
  }

  const body = await response.json();
  refresh();
  return toDomain(body.data);
}

export async function deleteCalibrationAction(id: number) {
  const response = await backendFetch(`/calibrations/${id}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) {
    throw new Error("Não foi possível excluir a calibração");
  }

  refresh();
}
