import { AlertTriangle, XCircle } from "lucide-react";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  availabilityLabels,
  availabilityColors,
} from "@/components/filament-form-fields";
import type { Filament } from "@/lib/types/filament";

const alertIcons: Record<
  "indisponivel" | "quase_acabando",
  typeof AlertTriangle
> = {
  indisponivel: XCircle,
  quase_acabando: AlertTriangle,
};

const alertRowStyles: Record<"indisponivel" | "quase_acabando", string> = {
  indisponivel: "border-red-500 bg-red-50 dark:bg-red-950/30",
  quase_acabando: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
};

const alertIconColors: Record<"indisponivel" | "quase_acabando", string> = {
  indisponivel: "text-red-800 dark:text-red-500",
  quase_acabando: "text-yellow-800 dark:text-yellow-500",
};

export default function Home() {
  const alerts = db
    .prepare(
      `SELECT * FROM filaments
       WHERE availability IN ('indisponivel', 'quase_acabando')
       ORDER BY availability ASC, name ASC`,
    )
    .all() as Filament[];

  return (
    <div className="flex flex-col gap-4">
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alertas de filamento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {alerts.map((filament) => {
              const availability = filament.availability as
                | "indisponivel"
                | "quase_acabando";
              const Icon = alertIcons[availability];

              return (
                <div
                  key={filament.id}
                  className={`flex items-center gap-2 rounded-md border-l-4 p-2 text-sm ${alertRowStyles[availability]}`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${alertIconColors[availability]}`}
                  />
                  <span className="flex-1">{filament.name}</span>
                  <span className={availabilityColors[availability]}>
                    {availabilityLabels[availability]}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
