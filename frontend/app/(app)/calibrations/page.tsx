import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationFormDialog } from "@/components/calibration-form-dialog";
import { CalibrationsPageContent } from "@/components/calibrations-page-content";
import type { CalibrationWithFilament } from "@/lib/types/calibration";
import type { FilamentOption } from "@/lib/types/filament";

export default function CalibrationsPage() {
  const calibrations = db
    .prepare(
      `SELECT calibrations.*, filaments.name AS filament_name, filaments.color AS filament_color
       FROM calibrations
       LEFT JOIN filaments ON calibrations.filament_id = filaments.id
       ORDER BY calibrations.created_at DESC`
    )
    .all() as CalibrationWithFilament[];

  const filamentOptions = db
    .prepare(
      `SELECT filaments.id, filaments.name, filaments.color, filaments.material,
              filament_brands.name AS brand_name
       FROM filaments
       LEFT JOIN filament_brands ON filaments.brand_id = filament_brands.id
       ORDER BY filaments.name ASC`
    )
    .all() as FilamentOption[];

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
