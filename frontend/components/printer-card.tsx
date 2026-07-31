"use client";

import { useState } from "react";
import { Printer as PrinterIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrinterDetailsDialog } from "@/components/printer-details-dialog";
import type { Printer } from "@/lib/types/printer";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PrinterCard({ printer }: { printer: Printer }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="cursor-pointer transition hover:ring-primary/40"
      >
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
      <PrinterDetailsDialog printer={printer} open={open} onOpenChange={setOpen} />
    </>
  );
}
