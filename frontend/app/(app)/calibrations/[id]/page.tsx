import { notFound } from "next/navigation";

import { CalibrationDetailView } from "@/components/calibration-detail-view";
import { getCalibration } from "@/lib/actions/calibrations";
import { getFilament, getFilamentOptions } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import type { CalibrationWithFilament } from "@/lib/types/calibration";

export default async function CalibrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const calibrationId = Number(id);

  if (Number.isNaN(calibrationId)) notFound();

  const [calibration, filamentOptions] = await Promise.all([
    getCalibration(calibrationId),
    getFilamentOptions(),
  ]);

  if (!calibration) notFound();

  const filament =
    calibration.filament_id != null ? await getFilament(calibration.filament_id) : null;

  const calibrationWithFilament: CalibrationWithFilament = {
    ...calibration,
    ...filamentDenormalizedFields(filament),
  };

  return (
    <CalibrationDetailView
      calibration={calibrationWithFilament}
      filamentOptions={filamentOptions}
    />
  );
}
