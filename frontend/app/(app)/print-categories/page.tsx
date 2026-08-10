import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintCategoryFormDialog } from "@/components/print-category-form-dialog";
import { PrintCategoryCard } from "@/components/print-category-card";
import { getPrintCategories } from "@/lib/actions/print-categories";

export default async function PrintCategoriesPage() {
  const categories = await getPrintCategories();

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categorias</h1>
        <PrintCategoryFormDialog />
      </div>

      {sortedCategories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma categoria cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((category) => (
            <PrintCategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
