import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtraItemFormDialog } from "@/components/extra-item-form-dialog";
import { ExtraItemCard } from "@/components/extra-item-card";
import { getExtraItems } from "@/lib/actions/extra-items";

export default async function ExtraItemsPage() {
  const extraItems = await getExtraItems();

  const sortedExtraItems = [...extraItems].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Itens Extras</h1>
        <ExtraItemFormDialog />
      </div>

      {sortedExtraItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhum item extra cadastrado ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedExtraItems.map((extraItem) => (
            <ExtraItemCard key={extraItem.id} extraItem={extraItem} />
          ))}
        </div>
      )}
    </div>
  );
}
