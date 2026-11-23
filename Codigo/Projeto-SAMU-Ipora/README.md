# Análise de Grafos - Malha de Atendimento SAMU 192 (Microrregião de Iporá - GO)

Projeto acadêmico de **Teoria dos Grafos** e **Algoritmos em Grafos** aplicado à rede de urgência e emergência móvel pré-hospitalar do SAMU 192 na microrregião de Iporá (GO).

---

## 1. Descrição do Problema e Modelagem

Como **Iporá** é o único município da microrregião que possui uma **Unidade de Suporte Avançado (USA-01 / UTI Móvel)**, qualquer chamado classificado como **Código Vermelho (Gravidade 3 - risco iminente de morte)** em qualquer uma das 10 cidades mobiliza obrigatoriamente a USA sediada em Iporá.

### Regras de Conexão no Grafo:
* As **cidades não se interligam diretamente entre si**, respeitando a geografia viária real.
* As conexões intermunicipais são estritamente intermediadas por **Trechos Rodoviários com quilometragem exata** (GO-060, GO-174, GO-320, GO-173, GO-326, GO-164 e GO-444) e **Entroncamentos/Trevos**.
* O grafo é modelado como **não-orientado e ponderado**, onde os pesos representam a extensão rodoviária em quilômetros.

---

## 2. Requisitos e Instalação

* **Python:** Versão 3.10 ou superior.
* **Bibliotecas necessárias:** Listadas em `requirements.txt` (`networkx` e `pyyaml`).

Para instalar as dependências, execute:

```bash
pip install -r requirements.txt
```

---

## 3. Instruções de Execução

O script foi desenvolvido para ser executado com um **único comando**, recebendo como argumento o diretório relativo do vault:

```bash
python analise.py vault/
```

> **Nota:** Não há caminhos absolutos no código. O script lê dinamicamente a pasta informada via argumento de linha de comando.

---

## 4. O que o Script Executa e Imprime

1. **Leitura e Parsing do Vault (Sem bibliotecas de Obsidian):**
   * Percorre recursivamente todos os arquivos `.md` do diretório informado.
   * Extrai o frontmatter YAML (metadados de tipo, distâncias, tempos e frotas).
   * Extrai e normaliza todos os wikilinks (`[[nota]]`, `[[nota|alias]]`, `[[nota#seção]]`).
   * Detecta e reporta eventuais links para notas inexistentes (links quebrados).

2. **Construção do Grafo Ponderado:**
   * Monta o grafo com 34 vértices e 53 arestas ponderadas.

3. **Algoritmo da Equipe (Dijkstra - Caminhos Mínimos):**
   * Implementação própria utilizando fila de prioridade binária (`heapq`).
   * **Complexidade:** $O((V + E) \log V)$.
   * **Justificativa:** Modela com precisão o cálculo da rota de menor distância/tempo da base em Iporá até qualquer município, sendo preferido a Bellman-Ford ($O(VE)$, focado em pesos negativos inexistentes na física rodoviária) e BFS (apenas para grafos não ponderados).

4. **Verificação Automática de Corretude:**
   * Executa a verificação em **dois grafos de teste pequenos** com gabarito teórico conhecido (exemplo clássico de livro com 5 vértices e grafo diamante com 4 vértices).
   * Executa a verificação no **Grafo Real do Vault**, comparando vértice a vértice a saída da equipe contra o `networkx.single_source_dijkstra_path_length`.
   * Imprime `OK` para cada teste bem-sucedido.

5. **Relatório e Salvamento de Resultados:**
   * Imprime na tela o resumo completo da topologia (graus, componentes conexos, densidade).
   * Imprime a tabela de despacho de Código Vermelho para todas as 10 cidades, com o trajeto passo a passo de rodovias e entroncamentos.
   * Salva automaticamente o relatório idêntico em `resultados.txt`.

---

## 5. Estrutura do Repositório

```
Projeto-SAMU-Ipora/
├── analise.py             # Script principal de análise e algoritmos da equipe
├── requirements.txt       # Dependências mínimas do projeto
├── README.md              # Documentação e instruções de execução
├── resultados.txt         # Saída gerada automaticamente após a execução
└── vault/                 # Base de conhecimento em Markdown do Obsidian
    ├── 00_Regulação_e_SAMU/
    ├── 01_Cidades/
    ├── 02_Entroncamentos/
    ├── 03_Rodovias_e_Trechos/
    └── .obsidian/
```
