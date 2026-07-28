import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PrinterFormDialog } from "@/components/printer-form-dialog";
import { PrinterCard } from "@/components/printer-card";
import type { Printer } from "@/lib/types/printer";

export default function PrintersPage() {
  const printers = db
    .prepare("SELECT * FROM printers ORDER BY created_at DESC")
    .all() as Printer[];

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
