import Link from "next/link";
import {
  ArrowLeftIcon,
  Gauge,
  Info,
  Lightbulb,
  ListChecks,
  Ruler,
  Thermometer,
  Undo2,
  Video,
  Waves,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CalibrationStep = {
  number: number;
  icon: typeof Thermometer;
  title: string;
  goal: string;
  howTo: string[];
  analysis: string[];
  action: string;
  tip?: string;
};

const STEPS: CalibrationStep[] = [
  {
    number: 1,
    icon: Thermometer,
    title: "Calibração de Temperatura",
    goal: "Ajusta a temperatura ideal do bico para o seu filamento.",
    howTo: [
      "No menu do Creality Print, vá em Calibração > Temperatura.",
      "Escolha o seu tipo de filamento (ex: PLA).",
      "Clique em OK para gerar o modelo da Torre de Temperatura e clique em Fatiar / Imprimir.",
    ],
    analysis: [
      "Observe as teias de aranha (stringing), o acabamento das pontes (bridges) e o balanço (overhang).",
      "Identifique a temperatura da zona que teve a menor quantidade de teias e a melhor qualidade nas camadas.",
    ],
    action:
      "Na aba lateral, clique no ícone de lápis ao lado do seu filamento, procure por Print Temperature e insira o valor encontrado na torre. Salvar.",
  },
  {
    number: 2,
    icon: Waves,
    title: "Calibração do Fluxo (Flow Ratio)",
    goal: "Ajusta a quantidade exata de filamento que o bico deve expelir, em duas etapas.",
    howTo: [
      "Passo 2.1 (Ajuste Básico): vá em Calibração > Fluxo > Passo 1 e imprima as peças do teste.",
      "Passo 2.2 (Ajuste Fino): vá em Calibração > Fluxo > Passo 2, selecione o número da peça escolhida no Passo 2.1 e imprima o novo teste.",
    ],
    analysis: [
      "Passo 2.1: escolha a peça mais lisa e sem lacunas visíveis no topo (exemplo: peça escolhida = +15).",
      "Passo 2.2: passe a unha pelas peças e escolha a que estiver lisa ao toque e com linhas perfeitamente unidas (exemplo: peça escolhida = -5).",
    ],
    action:
      "Some os dois resultados (exemplo: 15 + (-5) = 10) e adicione essa porcentagem ao Flow Ratio atual no perfil do filamento (ícone do lápis) — ex.: se era 0.95, somando 10% o novo valor será 1.05. Salvar.",
  },
  {
    number: 3,
    icon: Gauge,
    title: "Calibração do Pressure Advance (PA)",
    goal: "Evita acúmulo de material ou cantos arredondados nas quinas da impressão.",
    howTo: [
      "Vá em Calibração > Pressure Advance > PA Line.",
      "Selecione o tipo da sua impressora: Direct Drive ou Bowden.",
      "Imprima a peça com o padrão de linhas.",
    ],
    analysis: [
      "Observe as linhas impressas.",
      "Escolha a linha que está com a largura mais uniforme e contínua (sem falhas de material ou bolhas de acúmulo).",
    ],
    action:
      "No perfil do filamento (ícone do lápis), marque Enable Pressure Advance, insira o número da linha escolhida (ex.: 0.044) e salve.",
  },
  {
    number: 4,
    icon: Undo2,
    title: "Calibração de Retração",
    goal: 'Ajusta o "puxão" de filamento para evitar teias ao mover o cabeçote.',
    howTo: [
      "Vá em Calibração > Retração > Distância.",
      "Preencha os valores sugeridos: Direct Drive (Começo 0.1, Fim 2.0, Passo 0.1) ou Bowden (Começo 1.0, Fim 4.0, Passo 0.2).",
      "Imprima a Torre de Retração.",
    ],
    analysis: [
      "Olhe as marcações nas hastes da torre (cada degrau é um step de incremento).",
      "Identifique o degrau mais baixo onde as teias desapareceram totalmente.",
    ],
    action:
      "Em Configurações da Impressora (ícone da impressora > lápis) > Extruder 1, insira a altura identificada em Retraction Length. Salvar.",
    tip: "Se as teias continuarem fortes em toda a torre, o seu filamento provavelmente está com umidade. Seque o filamento antes de tentar novamente.",
  },
  {
    number: 5,
    icon: Ruler,
    title: "Velocidade Volumétrica Máxima (Max Flow Rate)",
    goal: "Descobre o limite de velocidade em que a sua impressora consegue derreter o filamento mantendo a qualidade.",
    howTo: [
      "Vá em Calibração > Max Volume Flow e clique em OK.",
      "Imprima a peça de teste (leva cerca de 40 min).",
    ],
    analysis: [
      "Com uma régua ou paquímetro, meça a altura da peça (a partir da base) até o ponto exato onde a impressão começa a perder qualidade ou espaçar camadas (exemplo: 27 mm).",
      "Calcule o fluxo volumétrico: 5 + (medida em mm × 0.5). Exemplo: 5 + (27 × 0.5) = 18.5.",
    ],
    action:
      "Abra o perfil do filamento (ícone do lápis), ative a opção Advance e insira o resultado no campo Max Volumetric Speed. Salvar.",
  },
];

export default function CrealityPrintCalibrationPage() {
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
