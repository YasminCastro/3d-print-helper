import Link from "next/link";
import { ArrowLeftIcon, Info, Lightbulb, ListChecks, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationWizardDialog } from "@/components/calibration-wizard-dialog";
import { getFilamentOptions } from "@/lib/actions/filaments";
import { CREALITY_CALIBRATION_GUIDE } from "@/lib/slicer-calibration-guides";

const STEPS = CREALITY_CALIBRATION_GUIDE;

export default async function CrealityPrintCalibrationPage() {
  const filamentOptions = await getFilamentOptions();

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
        <Badge variant="secondary">Creality Print</Badge>
      </div>

      <div className="flex justify-end">
        <CalibrationWizardDialog slicer="creality" filamentOptions={filamentOptions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Guia Rápido de Calibração no Creality Print
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            Este tutorial passa pelos 5 passos essenciais para calibrar a sua impressora 3D e
            garantir impressões perfeitas.
          </p>
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-foreground">
            <ListChecks className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">Pré-requisitos</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Software: Creality Print aberto.</li>
                <li>Ferramentas necessárias: régua ou paquímetro.</li>
                <li>Ordem de execução: siga os passos na ordem listada abaixo.</li>
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-foreground">
            <Video className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              <span className="font-medium">Referência:</span>{" "}
              <a
                href="https://www.youtube.com/watch?v=l8cSIx0D-L8&t=1026s"
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

            {step.tip && (
              <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p>
                  <span className="font-medium">Dica de Ouro:</span> {step.tip}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
