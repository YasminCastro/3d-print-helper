import Link from "next/link";
import { Printer as PrinterIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Printer } from "@/lib/types/printer";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PrinterCard({ printer }: { printer: Printer }) {
  return (
    <Link href={`/printers/${printer.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer transition hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <PrinterIcon className="size-4 text-primary" />
          <CardTitle className="text-base">{printer.name}</CardTitle>
        </CardHeader>
        {printer.purchasePrice != null && (
          <CardContent className="text-sm text-muted-foreground">
            {currencyFormatter.format(printer.purchasePrice)}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
