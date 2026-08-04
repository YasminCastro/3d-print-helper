import Link from "next/link";
import { ClockIcon, Printer as PrinterIcon, ZapIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Printer } from "@/lib/types/printer";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ACCENT_CLASSES = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function accentFor(id: number) {
  return ACCENT_CLASSES[id % ACCENT_CLASSES.length];
}

export function PrinterCard({ printer }: { printer: Printer }) {
  return (
    <Link href={`/printers/${printer.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accentFor(printer.id)}`}
          >
            <PrinterIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{printer.name}</CardTitle>
            {printer.brand && (
              <p className="truncate text-xs text-muted-foreground">
                {printer.brand}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-auto flex flex-wrap items-center gap-2">
          {printer.purchasePrice != null && (
            <Badge variant="secondary">
              {currencyFormatter.format(printer.purchasePrice)}
            </Badge>
          )}
          {printer.powerConsumptionW != null && (
            <Badge variant="outline">
              <ZapIcon className="size-3" />
              {printer.powerConsumptionW} W
            </Badge>
          )}
          {printer.lifespanHours != null && (
            <Badge variant="outline">
              <ClockIcon className="size-3" />
              {printer.lifespanHours} h
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
