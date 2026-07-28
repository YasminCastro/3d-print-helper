import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandFormDialog } from "@/components/brand-form-dialog";
import { BrandsPageContent } from "@/components/brands-page-content";
import { brandAveragePrice, computeCostBenefit, groupAveragePrice } from "@/lib/cost-benefit";
import type { FilamentBrand } from "@/lib/types/brand";

export default function BrandsPage() {
  const brands = db
    .prepare("SELECT * FROM filament_brands ORDER BY name ASC")
    .all() as FilamentBrand[];

  const averagePrice = groupAveragePrice(brands);
  const items = brands.map((brand) => ({
    brand,
    costBenefit: computeCostBenefit(brandAveragePrice(brand), averagePrice),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Marcas de Filamento</h1>
        <BrandFormDialog />
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma marca cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <BrandsPageContent items={items} />
      )}
    </div>
  );
}
