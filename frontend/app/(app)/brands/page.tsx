import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandFormDialog } from "@/components/brand-form-dialog";
import { BrandsPageContent } from "@/components/brands-page-content";
import { getBrandListItems } from "@/lib/brand-helpers";

export default async function BrandsPage() {
  const items = await getBrandListItems();
  items.sort((a, b) => a.brand.name.localeCompare(b.brand.name));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Marcas de Filamento</h1>
        <BrandFormDialog />
      </div>

      {items.length === 0 ? (
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
