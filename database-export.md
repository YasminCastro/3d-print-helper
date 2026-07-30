# 3D Print Helper — Export do Banco de Dados

> Exportado em 2026-07-30 a partir de `frontend/data/print-helper.db` (SQLite).

## Sumário

- [Configurações](#configurações)
- [Impressoras](#impressoras)
- [Marcas de Filamento](#marcas-de-filamento)
- [Filamentos](#filamentos)
- [Categorias de Impressão](#categorias-de-impressão)
- [Impressões](#impressões)
- [Calibrações](#calibrações)
- [Diário (Journal)](#diário-journal)

---

## Configurações

| Lucro padrão (%) |
|---|
| 100 |

---

## Impressoras

| ID | Nome | Marca | Modelo | Consumo (W) | Custo manutenção/h | Preço compra | Vida útil (h) | Custo energia (kWh) |
|---|---|---|---|---|---|---|---|---|
| 1 | Ender 3 V3 KE | Creality | — | 150 | R$ 0,25 | R$ 2.000,00 | 8.000 | R$ 0,61 |

---

## Marcas de Filamento

| ID | Nome | Onde comprar | Preço min | Preço max | Custo-benefício | Tipos de filamento | Melhores cores | Já comprei | Notas |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Voolt3D | Mercado Livre, Amazon, Shopee, site próprio (voolt3d.com) — site próprio costuma ser mais barato, mas cobra frete | — | — | Moderado | pla, pla_duo_color, pla_matte, pla_tri_color, petg, pla_silk | — | Sim | Problema com o PLA rosa pastel (2026-07-27). Linha outlet: comprei um verde pastel, gostei — vem um pouco manchado, mas vale a pena quando a cor não precisa ser uniforme (2026-07-27). |
| 2 | Anycubic | — | R$ 99,00 | R$ 170,00 | Bom | pla | Cores Base | — | — |
| 3 | MasterPrint | — | R$ 65,00 | R$ 130,00 | Bom | petg | — | — | — |
| 4 | Soleyin | — | R$ 95,00 | R$ 126,00 | Bom | pla | Branco, Preto | — | — |
| 5 | Elegoo | — | R$ 87,00 | R$ 130,00 | — | pla_matte | — | — | Recomendação (TikTok, 2026-07-27): linha com as cores pastel mais bonitas. |
| 6 | FlashForge | — | R$ 99,00 | R$ 175,00 | — | pla | — | — | — |
| 7 | F3D | Amazon | — | — | — | pla | — | Não | — |

---

## Filamentos

| ID | Nome | Material | Marca | Cor | Disponível | Status | Nota | Últ. compra | Preço pago (min–max) | Temp. bico (min–max) | Temp. mesa (min–max) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Preto Velvet | pla_matte | Voolt3D | ⬛ #000000 | Sim | Quase acabando | ★★★★★ | 2026-01-14 | R$ 108,00 – R$ 121,90 | 205–220 °C | 70–75 °C |
| 2 | Amarelo Velvet | pla_matte | Voolt3D | 🟨 #f2d457 | Sim | Disponível | ★★★★★ | 2025-08-04 | R$ 120,00 | 205–220 °C | 70–75 °C |
| 3 | Vermelho | pla | Voolt3D | 🟥 #fc0303 | Sim | Disponível | ★★★★★ | 2026-01-14 | R$ 114,00 | 190–230 °C | 50–75 °C |
| 4 | Azul | pla | Voolt3D | 🟦 #2eafff | Não | Disponível | ★★★★★ | 2026-01-14 | R$ 114,00 | 190–230 °C | 50–70 °C |
| 5 | Verde Velvet | pla_matte | Voolt3D | 🟩 #28bd32 | Sim | Disponível | ★★★★★ | 2025-08-04 | R$ 105,00 | 205–220 °C | 70–75 °C |
| 6 | Branco Dental | pla | Voolt3D | ⬜ #ffffff | Sim | Disponível | ★★★★★ | 2026-01-14 | R$ 114,00 – R$ 128,00 | 190–230 °C | 50–70 °C |
| 7 | Dourado | pla_silk | Voolt3D | 🟨 #ffca0a | Sim | Quase acabando | ★★★★★ | 2026-03-04 | R$ 128,00 | 205–235 °C | 65–80 °C |
| 8 | Verde Silk | pla_silk | Voolt3D | 🟩 #00ff04 | — | Disponível | ★★★★★ | 2025-08-04 | R$ 127,00 | 205–230 °C | 65–80 °C |
| 9 | Ametista e Verde | pla_silk | Voolt3D | 🟣 #d463e3 | — | Indisponível | ★★★★★ | 2025-07-19 | R$ 142,00 | 205–230 °C | 60–80 °C |
| 10 | Cinza Grafite | pla | Voolt3D | ⬛ #6b6b6b | — | Disponível | ★★★★★ | 2026-06-01 | R$ 128,00 | 190–230 °C | 50–70 °C |
| 11 | Amarelo Macaron | pla_matte | Voolt3D | 🟨 #ffffc5 | — | Disponível | ★★★★★ | 2026-06-04 | R$ 124,00 | 205–220 °C | 70–75 °C |
| 12 | Rosa Bebê | pla_matte | Voolt3D | 🟪 #ffb5c0 | — | Disponível | ★★☆☆☆ | 2026-06-04 | R$ 124,00 | 205–220 °C | 70–75 °C |
| 13 | Azul Bandeira | pla | F3D | 🟦 #0000ff | — | Disponível | ★★★★★ | 2026-06-04 | R$ 85,50 | 205–230 °C | 50–65 °C |
| 14 | Troca de Cor - Verde Água | pla | Voolt3D | 🟢 #66f1c2 | — | Disponível | ★★★★☆ | 2026-07-02 | R$ 59,90 | 190–230 °C | 50–70 °C |
| 15 | Preto | petg | Voolt3D | ⬛ #000000 | — | Indisponível | ★★★★★ | 2025-07-14 | R$ 119,00 | 225–250 °C | 60–90 °C |

**Links de compra:**
- **Preto Velvet**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-pla-preto-velvet-premium/)
- **Amarelo Velvet**: [amazon.com.br](https://www.amazon.com.br/dp/B0C15HPBBX)
- **Vermelho**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-pla-vermelho-premium/)
- **Azul**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-pla-azul-premium/)
- **Verde Velvet**: [amazon.com.br](https://www.amazon.com.br/dp/B0C15HX45V)
- **Branco Dental**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-pla-branco-dental-premium/)
- **Dourado**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-pla-dourado-v-silk-premium/)
- **Verde Silk**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-pla-verde-v-silk-premium/)
- **Ametista e Verde**: [mercadolivre.com.br](https://www.mercadolivre.com.br/filamento-pla-duo-verde-ametista-shadow-v-silk-1kg-fabricaco-nacional-voolt3d/p/MLB64151395)
- **Cinza Grafite**: [amazon.com.br](https://www.amazon.com.br/dp/B09HMX39WH)
- **Amarelo Macaron**: [amazon.com.br](https://www.amazon.com.br/dp/B0D482GPS4)
- **Rosa Bebê**: [amazon.com.br](https://www.amazon.com.br/dp/B0DNTVHYSJ)
- **Azul Bandeira**: [amazon.com.br](https://www.amazon.com.br/dp/B0FK6Q85V6)
- **Troca de Cor - Verde Água**: [shopee.com.br](https://shopee.com.br/Filamento-PLA-Outlet-1kg-para-Impressora-3D-FDM-1-75mm-Voolt3D-i.313159848.10113558817)
- **Preto (PETG)**: [voolt3d.com.br](https://voolt3d.com.br/produtos/filamento-petg-hf-preto-high-fluidity-premium-1kg/)

---

## Categorias de Impressão

| ID | Nome |
|---|---|
| 1 | Decoração |
| 2 | Acessórios Eletrônicos |
| 3 | Chaveiros |
| 4 | Acessórios Impressão 3D |

---

## Impressões

| ID | Nome | Categoria | Data | Duração | Status | Resultado | Custo filamento | Custo impressão | Valor venda | Valor venda (pior caso) | Lucro % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Macaco Bundudo | Decoração | 2026-07-23 | 2h50min | Pronto | Perfeito | R$ 6,10 | R$ 7,07 | R$ 14,14 | R$ 14,34 | 100% |
| 3 | Flexible & sturdy phone arm | Acessórios Eletrônicos | 2026-07-30 | 14h34min | Pronto | Bom | R$ 33,82 | R$ 38,79 | R$ 77,59 | R$ 95,79 | 100% |
| 4 | Porco Croche | Chaveiros | 2026-07-24 | 1h32min | Pronto | Bom | R$ 2,85 | R$ 3,37 | R$ 6,75 | R$ 6,75 | 100% |
| 5 | Led light bar for Ender 3 V3 KE | Acessórios Impressão 3D | 2026-07-23 | 3h00min | Pronto | Perfeito | R$ 10,24 | R$ 11,26 | R$ 22,53 | R$ 22,89 | 100% |
| 6 | The AMP - Phone speaker | Acessórios Eletrônicos | 2026-07-22 | 4h55min | Pronto | Perfeito | R$ 8,21 | R$ 9,89 | R$ 19,78 | R$ 38,44 | 100% |

**Filamentos usados por impressão:**
- **Macaco Bundudo**: Preto Velvet — 50g
- **Flexible & sturdy phone arm**: Rosa Bebê — 22g, Preto Velvet — 1g
- **Porco Croche**: Preto Velvet — 215g, Troca de Cor - Verde Água — 127g
- **Led light bar for Ender 3 V3 KE**: Preto Velvet — 84g
- **The AMP - Phone speaker**: Troca de Cor - Verde Água — 137g

**Links dos modelos:**
- **Macaco Bundudo**: [makerworld.com](https://makerworld.com/pt/models/2485148-thicc-gorilla-twerking)
- **Flexible & sturdy phone arm**: [makerworld.com](https://makerworld.com/pt/models/67146-flexible-sturdy-phone-arm-100-printed)
- **Porco Croche**: [makerworld.com](https://makerworld.com/pt/models/3062281-articulated-knitted-pig-keychain)
- **Led light bar for Ender 3 V3 KE**: [printables.com](https://www.printables.com/model/724543-led-light-bar-for-ender-3-v3-ke)
- **The AMP - Phone speaker**: [makerworld.com](https://makerworld.com/pt/models/546970-the-amp-phone-speaker)

---

## Calibrações

| ID | Slicer | Filamento | Status | Data | Temp. mesa (1ª/demais camadas) | Temp. bico (inicial/final) | Vel. volumétrica máx | Pressure advance | Flow ratio | Retração |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Orca | Preto Velvet (id 12*) | Calibrado | 2026-07-15 | 75 °C / 70 °C | 210 °C / 205 °C | 10 mm³/s | 0,04 | 0,97 | 0,4 mm |

> \* O `filament_id` da calibração aponta para o id 12, mas na tabela `filaments` o id 12 é "Rosa Bebê" — pode haver uma inconsistência de referência ou o filamento original foi substituído/reordenado desde a calibração.

---

## Diário (Journal)

### Entrada 1 — Warping em extremidade de peça comprida (PLA)

- **Data**: 2026-07-27
- **Filamento**: Preto Velvet
- **Status**: Resolvido
- **Sintoma**: Uma das extremidades da peça (comprida, tipo tira/braçadeira) descolou da mesa e curvou para cima durante a impressão — padrão clássico de warping. Foto anexada mostrava a ponta da peça levantada, destacada do restante que ficou reto sobre a mesa. Configurações usadas: mesa 70 °C, bico 210 °C. Impressora sem gabinete fechado. Mesa limpa antes da impressão.
- **Possíveis causas**: Corrente de ar (sem gabinete) e fan de resfriamento muito forte já na 1ª camada.
- **Foto**: `202676a9-701c-454b-b04e-775c8d06a075.jpg`

**Tentativas:**

1. **✅ Funcionou** — Ajuste no perfil "PLA Preto Velvet - Voolt" (Filament settings → Cooling):
   - *No cooling for the first*: 1 → 3 layers
   - *Model fan speed at layer*: 0 → 3

   Manter o fan desligado nas 3 primeiras camadas deu tempo do PLA aderir bem na mesa antes do resfriamento forçado, e resolveu o warping na ponta da peça comprida. Não foi necessário mexer em corrente de ar/gabinete.
