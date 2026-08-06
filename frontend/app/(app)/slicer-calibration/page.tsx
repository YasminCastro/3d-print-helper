import Link from "next/link";
import { ArrowRightIcon, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Slicer = {
  slug: string;
  name: string;
  available: boolean;
};

const SLICERS: Slicer[] = [
  { slug: "orca-slicer", name: "Orca Slicer", available: true },
  { slug: "creality-print", name: "Creality Print", available: true },
];

export default function SlicerCalibrationPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Calibração por Fatiador</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Escolha o fatiador que você utiliza para ver o guia de calibração de filamento
        correspondente.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SLICERS.map((slicer) => (
          <Card key={slicer.slug}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
                {slicer.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              {slicer.available ? (
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/slicer-calibration/${slicer.slug}`} />}
                >
                  Ver guia
                  <ArrowRightIcon />
                </Button>
              ) : (
                <Badge variant="secondary">Em breve</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
