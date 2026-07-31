import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FilamentFormDialog } from "@/components/filament-form-dialog";
import { FilamentsPageContent } from "@/components/filaments-page-content";
import { getBrands } from "@/lib/actions/brands";
import type { Filament, FilamentWithBrand } from "@/lib/types/filament";

export default async function FilamentsPage() {
  const brands = await getBrands();
  const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));

  const filamentsRaw = db
    .prepare("SELECT * FROM filaments ORDER BY name ASC")
    .all() as Filament[];

  const filaments: FilamentWithBrand[] = filamentsRaw.map((filament) => ({
    ...filament,
    brand_name: filament.brand_id != null ? (brandsById.get(filament.brand_id) ?? null) : null,
  }));

  const brandOptions = [...brands]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((brand) => ({ id: brand.id, name: brand.name }));

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
