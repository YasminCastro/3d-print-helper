import Link from "next/link";
import { ArrowLeftIcon, Droplets, Info, Lightbulb, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationWizardDialog } from "@/components/calibration-wizard-dialog";
import { getFilamentOptions } from "@/lib/actions/filaments";
import { getPrinters } from "@/lib/actions/printers";
import { getCalibrations } from "@/lib/actions/calibrations";
import { ORCA_CALIBRATION_GUIDE, ORCA_FINAL_TIPS } from "@/lib/slicer-calibration-guides";

const STEPS = ORCA_CALIBRATION_GUIDE;
const FINAL_TIPS = ORCA_FINAL_TIPS;

export default async function SlicerCalibrationPage() {
  const [filamentOptions, printers, calibrations] = await Promise.all([
    getFilamentOptions(),
    getPrinters(),
    getCalibrations(),
  ]);
  const printerOptions = printers.map((printer) => ({ id: printer.id, name: printer.name }));
  const lastPrinterId = [...calibrations]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .find((calibration) => calibration.printer_id != null)?.printer_id;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/slicer-calibration"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Calibração por Fatiador</h1>
        <Badge variant="secondary">Orca Slicer</Badge>
      </div>

      <div className="flex justify-end">
        <CalibrationWizardDialog
          slicer="orca"
          filamentOptions={filamentOptions}
          printerOptions={printerOptions}
          lastPrinterId={lastPrinterId}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Guia Definitivo: Calibração de Filamento na Impressão 3D
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Para obter impressões mais fortes, limpas e até 40% mais rápidas, a calibração do
            filamento é o passo mais importante.
          </p>
          <p>
            Ferramenta recomendada: <span className="font-medium text-foreground">Orca Slicer</span>{" "}
            (contém os melhores testes integrados).
          </p>
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-foreground">
            <Droplets className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              <span className="font-medium">Dica prévia:</span> certifique-se de que o filamento
              esteja bem seco antes de começar.
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-foreground">
            <Video className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              <span className="font-medium">Referência:</span>{" "}
              <a
                href="https://www.youtube.com/watch?v=gVU5If1VsAM"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Vídeo com o passo a passo completo
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {STEPS.map((step) => (
        <Card key={step.number}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {step.number}
              </span>
              <step.icon className="size-4 shrink-0 text-muted-foreground" />
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <p className="text-muted-foreground">{step.goal}</p>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Como fazer
              </h3>
              <ol className="list-decimal space-y-1 pl-4">
                {step.howTo.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Como analisar o resultado
              </h3>
              <ul className="list-disc space-y-1 pl-4">
                {step.analysis.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p>
                <span className="font-medium">O que fazer:</span> {step.action}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="size-4 shrink-0 text-muted-foreground" />
            Dicas Finais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
            {FINAL_TIPS.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
