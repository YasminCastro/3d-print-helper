import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FilamentFormDialog } from "@/components/filament-form-dialog";
import { FilamentsPageContent } from "@/components/filaments-page-content";
import { getBrands } from "@/lib/actions/brands";
import { getFilamentsWithBrand } from "@/lib/actions/filaments";

export default async function FilamentsPage() {
  const [filaments, brands] = await Promise.all([getFilamentsWithBrand(), getBrands()]);

  const sortedFilaments = [...filaments].sort((a, b) => a.name.localeCompare(b.name));

  const brandOptions = [...brands]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((brand) => ({ id: brand.id, name: brand.name }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Filamentos</h1>
        <FilamentFormDialog brandOptions={brandOptions} />
      </div>

      {sortedFilaments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhum filamento cadastrado ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <FilamentsPageContent filaments={sortedFilaments} brandOptions={brandOptions} />
      )}
    </div>
  );
}
