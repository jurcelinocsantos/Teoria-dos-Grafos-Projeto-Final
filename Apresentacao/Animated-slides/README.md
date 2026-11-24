# 🚑 Teoria dos Grafos - Projeto Final (SAMU 192 Iporá-GO)
## Apresentação Oficial em HTML5 Animada & Integrada ao GitHub

Apresentação interativa desenvolvida com rigor técnico e visual moderno para a banca de **Teoria dos Grafos** (4º Período — 2026/2) do **Instituto Federal Goiano — Campus Iporá**.

* **Alunos**: Jurcelino Castilho Dos Santos Neto & Raquel Roza Coelho
* **Orientador**: Prof. Newarney T. Costa
* **Instituição**: Instituto Federal Goiano — Campus Iporá
* **Repositório**: [`jurcelinocsantos/Teoria-dos-Grafos-Projeto-Final`](https://github.com/jurcelinocsantos/Teoria-dos-Grafos-Projeto-Final)

---

## 🧭 Estrutura dos 6 Slides

1. **Slide 1 — Capa Oficial**:
   - Título da pesquisa e apenas o nome dos dois alunos pesquisadores.
   - Símbolo do **IF Goiano Campus Iporá** no canto superior direito e numeração de página (*Página 1 de 6*).

2. **Slide 2 — Códigos de Ocorrência & UTI Móvel Centralizada**:
   - Triagem médica com 3 botões interativos:
     - **Código 1 (Verde)**: Atendimento leve.
     - **Código 2 (Amarelo)**: Urgência moderada (USB).
     - **Código 3 (Vermelho)**: Emergência crítica (USA-01 / UTI Móvel).
   - **Animação Interativa**: Ao clicar em qualquer código, uma ambulância estilizada atravessa a tela da esquerda para a direita com o giroflex na cor do código clicado e som sintetizado de alerta.
   - Explicação do gargalo operacional da **USA-01 centralizada em Iporá** para 10 municípios e as métricas do grafo viário: $|V| = 34$ e $|E| = 53$ pelas rodovias GO-060, GO-174, GO-320, etc.

3. **Slide 3 — Simulador do Grafo & Despacho em Tempo Real (Canvas)**:
   - Malha rodoviária desenhada no Canvas com vértices, arestas e distâncias.
   - **Deslocamento Real da Ambulância**: Ao selecionar ou clicar em qualquer cidade no mapa, uma ambulância sai de Iporá e percorre o caminho ótimo até o destino.
   - **Central de Despacho 192**: Informações em tempo real sobre pico de trânsito rodoviário, condições climáticas/pista e status do rádio de comunicação.

4. **Slide 4 — Matriz de Despacho e Resultados Globais**:
   - Tabela comparativa com os 10 municípios (Amorinópolis, Israelândia, Jaupaci, Ivolândia, Fazenda Nova, Moiporá, Novo Brasil, Córrego do Ouro e Cachoeira de Goiás).
   - Destaque para as zonas de **Alta Criticidade (> 70 km)**.

5. **Slide 5 — Recomendações Estratégicas para o SAMU**:
   - Protocolo aeromédico (helicóptero) para municípios acima de 90 km.
   - Protocolo de encontro (*rendezvous*) na rodovia com USB local.
   - Prioridade de conservação dos eixos rodoviários críticos (GO-060, GO-173, GO-320).

6. **Slide 6 — Conclusão & Agradecimentos**:
   - Fechamento com link direto para o repositório no GitHub para inspeção do código e relatório técnico.

---

## 🎮 Controles de Apresentação

* `➔` ou `Espaço`: Próximo slide
* `←`: Slide anterior
* `F`: Alternar Tela Cheia (*Fullscreen*)
* `Clique nos Códigos (Slide 2)`: Despacha a ambulância na cor correspondente
* `Clique no Mapa (Slide 3)`: Despacha a ambulância física até o município selecionado
