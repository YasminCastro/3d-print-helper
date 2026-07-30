"use server";

import { refresh } from "next/cache";

import { db } from "@/lib/db";
import { calibrationFormSchema, type CalibrationFormInput } from "@/lib/schemas/calibration";

function toRow(values: CalibrationFormInput) {
  const parsed = calibrationFormSchema.parse(values);

  return {
    slicer: parsed.slicer,
    filamentId: Number(parsed.filamentId),
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
    notes: parsed.notes ?? null,
  };
}

export async function createCalibrationAction(values: CalibrationFormInput) {
  const row = toRow(values);

  db.prepare(
    `INSERT INTO calibrations (
       slicer, filament_id, status, calibration_date,
       bed_temp_first_layer, bed_temp_other_layers, nozzle_temp_initial, nozzle_temp_final,
       max_volumetric_speed, pressure_advance, flow_ratio, retraction_distance, notes
     )
     VALUES (
       @slicer, @filamentId, @status, @calibrationDate,
       @bedTempFirstLayer, @bedTempOtherLayers, @nozzleTempInitial, @nozzleTempFinal,
       @maxVolumetricSpeed, @pressureAdvance, @flowRatio, @retractionDistance, @notes
     )`
  ).run(row);

  refresh();
}

export async function updateCalibrationAction(id: number, values: CalibrationFormInput) {
  const row = toRow(values);

  db.prepare(
    `UPDATE calibrations
     SET slicer = @slicer,
         filament_id = @filamentId,
         status = @status,
         calibration_date = @calibrationDate,
         bed_temp_first_layer = @bedTempFirstLayer,
         bed_temp_other_layers = @bedTempOtherLayers,
         nozzle_temp_initial = @nozzleTempInitial,
         nozzle_temp_final = @nozzleTempFinal,
         max_volumetric_speed = @maxVolumetricSpeed,
         pressure_advance = @pressureAdvance,
         flow_ratio = @flowRatio,
         retraction_distance = @retractionDistance,
         notes = @notes
     WHERE id = @id`
  ).run({ ...row, id });

  refresh();
}

export async function deleteCalibrationAction(id: number) {
  db.prepare("DELETE FROM calibrations WHERE id = ?").run(id);

  refresh();
}
