import { getPrinters } from "@/lib/actions/printers";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrinterFormDialog } from "@/components/printer-form-dialog";
import { PrinterCard } from "@/components/printer-card";

export default async function PrintersPage() {
  const printers = await getPrinters();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Impressoras</h1>
        <PrinterFormDialog />
      </div>

      {printers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma impressora cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {printers.map((printer) => (
            <PrinterCard key={printer.id} printer={printer} />
          ))}
        </div>
      )}
    </div>
  );
}
