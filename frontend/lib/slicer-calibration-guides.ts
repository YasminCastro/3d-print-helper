import type { LucideIcon } from "lucide-react";
import { Gauge, Ruler, Thermometer, Undo2, Waves } from "lucide-react";

export type ParamFieldKey =
  | "bedTempFirstLayer"
  | "bedTempOtherLayers"
  | "nozzleTempInitial"
  | "nozzleTempFinal"
  | "maxVolumetricSpeed"
  | "pressureAdvance"
  | "flowRatio"
  | "retractionDistance";

export type SlicerGuideStep = {
  number: number;
  icon: LucideIcon;
  title: string;
  goal: string;
  howTo: string[];
  analysis: string[];
  action: string;
  tip?: string;
  videoUrl?: string;
  fieldKeys: ParamFieldKey[];
};

export const ORCA_CALIBRATION_GUIDE: SlicerGuideStep[] = [
  {
    number: 1,
    icon: Thermometer,
    title: "Temperatura do Bico (Temperature Tower)",
    goal: "Determina a melhor temperatura para equilibrar acabamento visual e resistência mecânica.",
    howTo: [
      "No Orca Slicer, selecione um perfil genérico do mesmo material do filamento a ser calibrado.",
      "Vá no menu superior em Calibration > Temperature.",
      "Selecione o tipo de filamento como {{material}}.",
      "Preencha as configurações com a recomendação do fabricante: Start Temp {{startTemp}} e End Temp {{endTemp}}.",
      "Fatie e envie para impressão.",
    ],
    analysis: [
      "Observe: pontes (bridging), cantos, fiapos (stringing) e paredes externas.",
      "Escolha a temperatura que entregar a melhor combinação de acabamento.",
      "Em caso de dúvida entre duas temperaturas, prefira a mais alta — isso garante melhor fusão entre camadas e peças mais resistentes.",
    ],
    action:
      "Vá em Filament Settings > altere a temperatura > salve com um novo nome.",
    videoUrl: "https://youtu.be/gVU5If1VsAM?si=FOX9w7_4hiMinQAt&t=132",
    fieldKeys: [
      "bedTempFirstLayer",
      "bedTempOtherLayers",
      "nozzleTempInitial",
      "nozzleTempFinal",
    ],
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
    action:
      "Vá em Filament Settings > Max Volumetric Speed > insira o novo valor e salve.",
    tip: "Antes de salvar, feche e abra o Orca Slicer novamente para não salvar com os valores usados no teste.",
    videoUrl: "https://youtu.be/gVU5If1VsAM?si=hSAZkIeJMtqT_Dac&t=254",
    fieldKeys: ["maxVolumetricSpeed"],
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
    action:
      "Em Filament Settings, ative a opção Pressure Advance > insira o valor e salve.",
    fieldKeys: ["pressureAdvance"],
  },
  {
    number: 4,
    icon: Ruler,
    title: "Taxa de Fluxo (Flow Ratio)",
    goal: "Garante que a espessura de cada linha seja exata, evitando que a peça fique superdimensionada ou com lacunas.",
    howTo: [
      "Vá em Calibration > Flow Rate > Pass 1.",
      "Imprima as amostras numéricas.",
    ],
    analysis: [
      "Procure o quadrado com a superfície superior mais lisa e uniforme, sem ranhuras (excesso) e sem frestas entre as linhas (falta).",
      "Some/subtraia o valor escolhido ao seu Flow Ratio atual (ex.: se o atual é 1.0 e a melhor amostra foi -0.02, o novo valor será 0.98).",
    ],
    action:
      "Atualize o campo Flow Ratio nas configurações do filamento e salve.",
    fieldKeys: ["flowRatio"],
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
    action:
      "Em Filament Settings > aba Setting Override > ative e ajuste o Retraction Length.",
    fieldKeys: ["retractionDistance"],
  },
];

export const ORCA_FINAL_TIPS = [
  "Ordem é fundamental: realize os testes exatamente na ordem deste guia, pois um parâmetro afeta o outro.",
  "Cores diferentes: filamentos da mesma marca mas de cores diferentes podem necessitar de pequenos ajustes (especialmente em Flow Ratio e PA).",
  "Desative automações: ao usar esses perfis calibrados manualmente, desative as calibrações automáticas da impressora no início da impressão para economizar tempo e filamento.",
];

export const CREALITY_CALIBRATION_GUIDE: SlicerGuideStep[] = [
  {
    number: 1,
    icon: Thermometer,
    title: "Calibração de Temperatura",
    goal: "Ajusta a temperatura ideal do bico para o seu filamento.",
    howTo: [
      "No menu do Creality Print, vá em Calibração > Temperatura.",
      "Selecione o tipo de filamento como {{material}}.",
      "Preencha as configurações com a recomendação do fabricante: Start Temp {{startTemp}} e End Temp {{endTemp}}.",
      "Clique em OK para gerar o modelo da Torre de Temperatura e clique em Fatiar / Imprimir.",
    ],
    analysis: [
      "Observe as teias de aranha (stringing), o acabamento das pontes (bridges) e o balanço (overhang).",
      "Identifique a temperatura da zona que teve a menor quantidade de teias e a melhor qualidade nas camadas.",
    ],
    action:
      "Na aba lateral, clique no ícone de lápis ao lado do seu filamento, procure por Print Temperature e insira o valor encontrado na torre. Salvar.",
    videoUrl: "https://youtu.be/gVU5If1VsAM?si=FOX9w7_4hiMinQAt&t=132",
    fieldKeys: [
      "bedTempFirstLayer",
      "bedTempOtherLayers",
      "nozzleTempInitial",
      "nozzleTempFinal",
    ],
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
    fieldKeys: ["flowRatio"],
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
    fieldKeys: ["pressureAdvance"],
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
    fieldKeys: ["retractionDistance"],
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
    videoUrl: "https://youtu.be/gVU5If1VsAM?si=hSAZkIeJMtqT_Dac&t=254",
    fieldKeys: ["maxVolumetricSpeed"],
  },
];

export const GUIDE_STEPS_BY_SLICER: Record<
  "orca" | "creality",
  SlicerGuideStep[]
> = {
  orca: ORCA_CALIBRATION_GUIDE,
  creality: CREALITY_CALIBRATION_GUIDE,
};
