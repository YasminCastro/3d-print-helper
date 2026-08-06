import Link from "next/link";
import {
  ArrowLeftIcon,
  Droplets,
  Info,
  Lightbulb,
  Thermometer,
  Gauge,
  Waves,
  Ruler,
  Undo2,
  Video,
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
};

const STEPS: CalibrationStep[] = [
  {
    number: 1,
    icon: Thermometer,
    title: "Temperatura do Bico (Temperature Tower)",
    goal: "Determina a melhor temperatura para equilibrar acabamento visual e resistência mecânica.",
    howTo: [
      "No Orca Slicer, selecione a marca/tipo de filamento correto ou um perfil genérico.",
      "Vá no menu superior em Calibration > Temperature.",
      "Selecione o tipo de material para gerar a Torre de Temperatura.",
      "Fatie (Slice) e envie para impressão.",
    ],
    analysis: [
      "Observe: pontes (bridging), cantos, fiapos (stringing) e paredes externas.",
      "Escolha a temperatura que entregar a melhor combinação de acabamento.",
      "Em caso de dúvida entre duas temperaturas, prefira a mais alta — isso garante melhor fusão entre camadas e peças mais resistentes.",
    ],
    action: "Vá em Filament Settings > altere a temperatura > salve com um novo nome.",
  },
  {
    number: 2,
    icon: Waves,
    title: "Vazão Volumétrica Máxima (Max Volumetric Speed)",
    goal: "Define a quantidade máxima de plástico que sua impressora consegue derreter e empurrar por segundo sem perder qualidade.",
    howTo: [
      "Selecione o perfil de filamento com a temperatura já ajustada.",
      "Acesse Calibration > Max Flow Rate.",
      "Mantenha os valores padrão e imprima o modelo.",
    ],
    analysis: [
      "Procure a altura onde começam os primeiros defeitos de extrusão ou perda de brilho no plástico.",
      "Meça com um paquímetro a distância (em mm) da base até a altura do defeito.",
      "No Orca Slicer (na aba Preview), altere a visualização superior para Flow.",
      "Arraste a barra vertical até a altura medida para ver a vazão referente àquele ponto.",
      "Subtraia de 10% a 20% desse valor para ter uma margem de segurança.",
    ],
    action: "Vá em Filament Settings > Max Volumetric Speed > insira o novo valor e salve.",
  },
  {
    number: 3,
    icon: Gauge,
    title: "Pressure Advance (Fator K)",
    goal: "Evita cantos arredondados, acúmulos de plástico ou falhas ao acelerar e desacelerar a impressora.",
    howTo: [
      "Vá em Calibration > Pressure Advance.",
      "Selecione o seu tipo de extrusor (Direct Drive ou Bowden).",
      "Escolha o teste no formato PA Pattern (mais confiável).",
      "Importante: defina no teste a mesma velocidade e aceleração que você costuma usar para paredes externas (ex: 200 mm/s e 5000 mm/s²).",
      "Imprima o teste.",
    ],
    analysis: [
      "Olhe para as quinas das linhas impressas.",
      "Encontre a linha onde a quina está o mais reta e afiada possível, sem falhas ou excesso de plástico.",
      "Identifique o número (PA Value) correspondente a essa linha.",
    ],
    action: "Em Filament Settings, ative a opção Pressure Advance > insira o valor e salve.",
  },
  {
    number: 4,
    icon: Ruler,
    title: "Taxa de Fluxo (Flow Ratio)",
    goal: "Garante que a espessura de cada linha seja exata, evitando que a peça fique superdimensionada ou com lacunas.",
    howTo: ["Vá em Calibration > Flow Rate > Pass 1.", "Imprima as amostras numéricas."],
    analysis: [
      "Procure o quadrado com a superfície superior mais lisa e uniforme, sem ranhuras (excesso) e sem frestas entre as linhas (falta).",
      "Some/subtraia o valor escolhido ao seu Flow Ratio atual (ex.: se o atual é 1.0 e a melhor amostra foi -0.02, o novo valor será 0.98).",
    ],
    action: "Atualize o campo Flow Ratio nas configurações do filamento e salve.",
  },
  {
    number: 5,
    icon: Undo2,
    title: "Distância de Retração (Retraction Distance)",
    goal: 'Evita a "teia de aranha" (stringing) e pequenos relevos na superfície.',
    howTo: [
      "Vá em Calibration > Retraction Test.",
      "Para impressoras Direct Drive, mantenha os padrões. Para Bowden, defina o limite final para 6 mm.",
      "Imprima o teste.",
    ],
    analysis: [
      "O teste imprime anéis empilhados. Identifique a altura do primeiro anel onde o stringing desaparece completamente.",
      "Verifique no fatiador qual comprimento de retração corresponde àquela altura.",
    ],
    action: "Em Filament Settings > aba Setting Override > ative e ajuste o Retraction Length.",
  },
];

const FINAL_TIPS = [
  "Ordem é fundamental: realize os testes exatamente na ordem deste guia, pois um parâmetro afeta o outro.",
  "Cores diferentes: filamentos da mesma marca mas de cores diferentes podem necessitar de pequenos ajustes (especialmente em Flow Ratio e PA).",
  "Desative automações: ao usar esses perfis calibrados manualmente, desative as calibrações automáticas da impressora no início da impressão para economizar tempo e filamento.",
];

export default function SlicerCalibrationPage() {
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
