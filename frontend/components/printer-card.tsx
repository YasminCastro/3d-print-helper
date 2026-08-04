import Link from "next/link";
import { Printer as PrinterIcon } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { accentFor } from "@/lib/utils";
import type { Printer } from "@/lib/types/printer";

export function PrinterCard({ printer }: { printer: Printer }) {
  return (
    <Link href={`/printers/${printer.id}`} className="block h-full">
      <Card className="flex h-full flex-col cursor-pointer gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${printer.color ? "" : accentFor(printer.id)}`}
            style={
              printer.color
                ? { backgroundColor: `${printer.color}26`, color: printer.color }
                : undefined
            }
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
      </Card>
    </Link>
  );
}
