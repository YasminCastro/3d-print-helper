import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationFormDialog } from "@/components/calibration-form-dialog";
import { CalibrationsPageContent } from "@/components/calibrations-page-content";
import { getFilamentOptions, getFilaments } from "@/lib/actions/filaments";
import { filamentDenormalizedFields } from "@/lib/filament-helpers";
import { getCalibrations } from "@/lib/actions/calibrations";

export default async function CalibrationsPage() {
  const [filaments, calibrationsRaw] = await Promise.all([getFilaments(), getCalibrations()]);
  const filamentsById = new Map(filaments.map((filament) => [filament.id, filament]));

  const calibrations = [...calibrationsRaw]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((calibration) => ({
      ...calibration,
      ...filamentDenormalizedFields(
        calibration.filament_id != null ? filamentsById.get(calibration.filament_id) : null
      ),
    }));

  const filamentOptions = await getFilamentOptions();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Calibrações</h1>
        <CalibrationFormDialog filamentOptions={filamentOptions} />
      </div>

      {calibrations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma calibração cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <CalibrationsPageContent calibrations={calibrations} filamentOptions={filamentOptions} />
      )}
    </div>
  );
}
