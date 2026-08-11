import { notFound } from "next/navigation";

import { CalibrationDetailView } from "@/components/calibration-detail-view";
import { getCalibration } from "@/lib/actions/calibrations";
import { getFilament, getFilamentOptions } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getPrinter, getPrinters } from "@/lib/actions/printers";
import { printerNameDenormalizedField } from "@/lib/printer-helpers";
import type { CalibrationWithFilament } from "@/lib/types/calibration";

export default async function CalibrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const calibrationId = Number(id);

  if (Number.isNaN(calibrationId)) notFound();

  const [calibration, filamentOptions, printers] = await Promise.all([
    getCalibration(calibrationId),
    getFilamentOptions(),
    getPrinters(),
  ]);

  if (!calibration) notFound();

  const filament =
    calibration.filament_id != null ? await getFilament(calibration.filament_id) : null;
  const printer =
    calibration.printer_id != null ? await getPrinter(calibration.printer_id) : null;

  const calibrationWithFilament: CalibrationWithFilament = {
    ...calibration,
    ...filamentDenormalizedFields(filament),
    ...printerNameDenormalizedField(printer),
  };

  const printerOptions = printers.map((printer) => ({ id: printer.id, name: printer.name }));

  return (
    <CalibrationDetailView
      calibration={calibrationWithFilament}
      filamentOptions={filamentOptions}
      printerOptions={printerOptions}
    />
  );
}
