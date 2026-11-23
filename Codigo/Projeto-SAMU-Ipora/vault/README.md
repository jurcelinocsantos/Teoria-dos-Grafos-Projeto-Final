---
tipo: indice
titulo: Malha SAMU Microrregião de Iporá - Grafo Rodoviário e Despacho USA
tags:
  - indice
  - documentacao
  - grafo
---
# Malha de Atendimento SAMU 192 - Microrregião de Iporá (GO)

Este Vault para o **Obsidian** modela graficamente a rede de urgência e emergência da microrregião de Iporá (GO), com ênfase no atendimento a ocorrências de **Código 3 (Vermelho)**, que exigem a presença da **USA (Unidade de Suporte Avançado / UTI Móvel)**, sediada exclusivamente em Iporá.

## Regra de Conexão no Grafo
As **cidades não se ligam diretamente entre si** no grafo. Todas as conexões municipais são intermediadas estritamente por:
1. **Trechos Rodoviários:** Com a quilometragem (**KM exato**), tipo de pavimento e tempo estimado de resposta.
2. **Entroncamentos e Trevos:** Nós viários reais (GO-060, GO-174, GO-320, GO-173, GO-326, GO-164 e GO-444).
3. **Estrutura de Regulação:** Pela Central de Regulação 192 e o Protocolo Código Vermelho.

## Estrutura de Pastas e Cores no Graph View
- `00_Regulação_e_SAMU`: 🔴 Vermelho (Gestão e Viatura USA-01)
- `01_Cidades`: 🔵 Azul / Ciano (Os 10 Municípios)
- `02_Entroncamentos`: 🟡 Amarelo (Trevos e Confluências Rodoviárias)
- `03_Rodovias_e_Trechos`: 🟢 Verde / Laranja (Segmentos com KM exato)

## Navegação Inicial Recomendada
- Sede e Regulação: [[Central de Regulação de Urgências SAMU 192 Iporá]]
- Viatura Avançada: [[Viatura USA-01 Iporá (Suporte Avançado)]]
- Diretriz de Despacho: [[Protocolo Código Vermelho - Despacho USA]]
- Cidade Polo: [[Iporá]]

- Matriz de Asfalto e Tráfego: [[Matriz de Trafegabilidade e Picos de Trânsito]]
