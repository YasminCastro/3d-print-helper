import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FilamentFormDialog } from "@/components/filament-form-dialog";
import { FilamentsPageContent } from "@/components/filaments-page-content";
import type { FilamentWithBrand } from "@/lib/types/filament";

export default function FilamentsPage() {
  const filaments = db
    .prepare(
      `SELECT filaments.*, filament_brands.name AS brand_name
       FROM filaments
       LEFT JOIN filament_brands ON filaments.brand_id = filament_brands.id
       ORDER BY filaments.name ASC`
    )
    .all() as FilamentWithBrand[];

  const brandOptions = db
    .prepare("SELECT id, name FROM filament_brands ORDER BY name ASC")
    .all() as { id: number; name: string }[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Filamentos</h1>
        <FilamentFormDialog brandOptions={brandOptions} />
      </div>

      {filaments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhum filamento cadastrado ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <FilamentsPageContent filaments={filaments} brandOptions={brandOptions} />
      )}
    </div>
  );
}
