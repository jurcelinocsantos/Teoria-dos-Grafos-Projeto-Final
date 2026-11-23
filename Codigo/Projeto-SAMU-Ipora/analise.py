"""
Script de Analise de Grafos - Malha de Atendimento SAMU 192 (Microrregiao de Ipora - GO)
Disciplina: Teoria dos Grafos / Algoritmos em Grafos
Compatibilidade: Python 3.10+
Uso: python analise.py <diretorio_do_vault>
Exemplo: python analise.py vault/
"""

import os
import sys
import re
import time
import heapq
import random
import yaml
from typing import Dict, List, Tuple, Any, Optional, Set
import networkx as nx

# Fixacao de semente pseudoaleatoria para reprodutibilidade estrita
random.seed(42)


# ==============================================================================
# ETAPA 1: LEITURA DO VAULT E EXTRACAO DE METADADOS E WIKILINKS
# ==============================================================================

def extrair_frontmatter_e_links(caminho_arquivo: str) -> Tuple[str, Dict[str, Any], List[str]]:
    """
    Le um arquivo Markdown (.md) do vault, extraindo o titulo, o frontmatter YAML e os wikilinks.
    
    Trata links nas formas:
      - [[nota]]
      - [[nota|alias]]
      - [[nota#secao]]
      - [[nota#secao|alias]]
    
    Retorna:
      (titulo_nota, metadados_dict, lista_de_links_limpos)
    """
    try:
        with open(caminho_arquivo, "r", encoding="utf-8") as f:
            conteudo = f.read()
    except Exception as e:
        print(f"[ERRO] Falha ao ler arquivo '{caminho_arquivo}': {e}", file=sys.stderr)
        return "", {}, []

    nome_base = os.path.splitext(os.path.basename(caminho_arquivo))[0]
    metadados = {}
    corpo = conteudo

    # Extracao de Frontmatter YAML entre delimitadores '---'
    if conteudo.startswith("---"):
        partes = conteudo.split("---", 2)
        if len(partes) >= 3:
            bloco_yaml = partes[1]
            corpo = partes[2]
            try:
                dados_yaml = yaml.safe_load(bloco_yaml)
                if isinstance(dados_yaml, dict):
                    metadados = dados_yaml
            except Exception as ye:
                print(f"[AVISO] YAML invalido em '{nome_base}': {ye}", file=sys.stderr)

    # Titulo: prioriza campo 'titulo' do YAML ou usa o nome do arquivo
    titulo = metadados.get("titulo", nome_base)

    # Extracao de Wikilinks com regex: [[...]]
    padrao_link = re.compile(r"\[\[(.*?)\]\]")
    links_brutos = padrao_link.findall(corpo)
    links_limpos = []

    for lk in links_brutos:
        # Tratamento: remove alias (|) e ancoras de secao (#)
        alvo = lk.split("|")[0].split("#")[0].strip()
        if alvo:
            links_limpos.append(alvo)

    return nome_base, metadados, links_limpos


def carregar_vault(diretorio_vault: str) -> Tuple[Dict[str, Dict[str, Any]], List[Tuple[str, str]], List[Tuple[str, str]]]:
    """
    Percorre todos os arquivos .md do vault, ignorando pastas ocultas (como .obsidian).
    
    Retorna:
      - notas: dicionario mapeando nome_nota -> metadados e caminho
      - arestas_brutas: lista de tuplas (origem, destino)
      - links_quebrados: lista de tuplas (origem, destino_inexistente)
    """
    if not os.path.exists(diretorio_vault):
        raise FileNotFoundError(f"Diretorio do vault '{diretorio_vault}' nao encontrado.")

    if not os.path.isdir(diretorio_vault):
        raise NotADirectoryError(f"O caminho '{diretorio_vault}' nao e um diretorio.")

    notas = {}
    arestas_brutas = []
    links_pendentes = []

    for raiz, dirs, arquivos in os.walk(diretorio_vault):
        # Ignora diretorios ocultos/de configuracao do Obsidian
        dirs[:] = [d for d in dirs if not d.startswith(".")]

        for arq in arquivos:
            if arq.endswith(".md"):
                caminho_completo = os.path.join(raiz, arq)
                nome_nota, metadados, links = extrair_frontmatter_e_links(caminho_completo)
                if nome_nota:
                    metadados["_caminho"] = caminho_completo
                    metadados["_arquivo"] = arq
                    notas[nome_nota] = metadados
                    for dst in links:
                        links_pendentes.append((nome_nota, dst))

    # Identificacao de links quebrados (apontando para notas inexistentes)
    links_quebrados = []
    for src, dst in links_pendentes:
        if dst not in notas:
            links_quebrados.append((src, dst))
        else:
            arestas_brutas.append((src, dst))

    return notas, arestas_brutas, links_quebrados


# ==============================================================================
# ETAPA 2: MONTAGEM DO GRAFO PONDERADO
# ==============================================================================

def construir_grafo_malha(notas: Dict[str, Dict[str, Any]], arestas: List[Tuple[str, str]]) -> nx.Graph:
    """
    Constroi um grafo nao-orientado ponderado (nx.Graph) a partir das notas e links.
    
    Modelo de Ponderacao:
      - Se a aresta envolve um 'rodovia_trecho', o peso equivale a distancia_km / 2.0,
        garantindo que o caminho Cidade -> Trecho -> Entroncamento tenha comprimento
        exato igual a distancia_km do segmento rodoviario.
      - Arestas puramente urbanas ou institucionais recebem peso nominal de 1.0 km.
      - Todos os atributos do frontmatter sao acoplados aos vertices.
    """
    G = nx.Graph()

    for nome, meta in notas.items():
        G.add_node(nome, **meta)

    for u, v in arestas:
        if u == v:
            continue

        meta_u = notas.get(u, {})
        meta_v = notas.get(v, {})

        # Deteccao de atributos de peso em trecho rodoviario
        peso = 1.0
        tempo_min = 1.0

        if meta_u.get("tipo") == "rodovia_trecho" and "distancia_km" in meta_u:
            peso = float(meta_u["distancia_km"]) / 2.0
            tempo_min = float(meta_u.get("tempo_livre_min", 2.0)) / 2.0
        elif meta_v.get("tipo") == "rodovia_trecho" and "distancia_km" in meta_v:
            peso = float(meta_v["distancia_km"]) / 2.0
            tempo_min = float(meta_v.get("tempo_livre_min", 2.0)) / 2.0

        G.add_edge(u, v, weight=peso, tempo_min=tempo_min)

    return G


# ==============================================================================
# ETAPA 3: IMPLEMENTACAO DO ALGORITMO DA EQUIPE (DIJKSTRA)
# ==============================================================================

def dijkstra_equipe(grafo_nx: nx.Graph, origem: str) -> Tuple[Dict[str, float], Dict[str, Optional[str]]]:
    """
    Calcula os caminhos minimos e distancias a partir de um vertice de origem usando o Algoritmo de Dijkstra.
    
    JUSTIFICATIVA TEORICA E APLICACAO AO PROBLEMA (Item 4.6):
    ----------------------------------------------------------------------------
    1. Adequacao ao Problema: Modela com precisao a malha de urgencia do SAMU 192,
       onde a USA-01 de Ipora precisa atingir qualquer municipio no menor tempo/distancia.
    2. Tipo de Grafo Exigido: Grafo ponderado com pesos estritamente nao-negativos (w(u, v) >= 0),
       o que e satisfeito pelo dominio fisico de distancias rodoviarias e tempos de viagem.
    3. O que calcula: A menor distancia acumulada da origem s (Ipora) ate todos os demais vertices
       alcancaveis, alem da arvore de predecessores para reconstrucao das rotas de socorro.
    4. Complexidade Assintotica: O((V + E) log V), utilizando fila de prioridade binaria (heapq),
       sendo otima e altamente eficiente para grafos esparsos como redes rodoviarias.
    5. Motivo da Preferencia: Foi preferido sobre Bellman-Ford (que possui custo O(V*E) e se destina
       a grafos com pesos negativos, inexistentes aqui), sobre BFS (que so trata grafos nao ponderados)
       e sobre Floyd-Warshall (O(V^3), desnecessario pois o despacho da USA parte de fonte unica).
    ----------------------------------------------------------------------------
    """
    distancias: Dict[str, float] = {v: float("inf") for v in grafo_nx.nodes}
    predecessores: Dict[str, Optional[str]] = {v: None for v in grafo_nx.nodes}

    if origem not in grafo_nx:
        return distancias, predecessores

    distancias[origem] = 0.0
    pq: List[Tuple[float, str]] = [(0.0, origem)]
    visitados: Set[str] = set()

    while pq:
        d_atual, u = heapq.heappop(pq)

        if u in visitados:
            continue
        visitados.add(u)

        for v in grafo_nx.neighbors(u):
            if v not in visitados:
                peso = grafo_nx[u][v].get("weight", 1.0)
                nova_dist = d_atual + peso
                if nova_dist < distancias[v]:
                    distancias[v] = nova_dist
                    predecessores[v] = u
                    heapq.heappush(pq, (nova_dist, v))

    return distancias, predecessores


def reconstruir_caminho(predecessores: Dict[str, Optional[str]], destino: str) -> List[str]:
    """
    Reconstroi o caminho minimo da origem ate o destino a partir do mapa de predecessores.
    """
    caminho = []
    atual: Optional[str] = destino
    while atual is not None:
        caminho.append(atual)
        atual = predecessores.get(atual)
    return list(reversed(caminho))


# ==============================================================================
# ETAPA 4: VERIFICACAO COM IMPLEMENTACAO DE REFERENCIA E GRAFOS DE TESTE
# ==============================================================================

def executar_testes_verificacao(G_vault: nx.Graph, origem_vault: str) -> Tuple[bool, List[str]]:
    """
    Compara a implementacao da equipe com o NetworkX no grafo do vault e em 2 grafos de teste conhecidos.
    
    Retorna:
      (sucesso_global, lista_de_mensagens_de_status)
    """
    mensagens = []
    sucesso_global = True

    # -------------------------------------------------------------------------
    # Teste 1: Grafo Pequeno Classico de Livro (5 vertices, 7 arestas)
    # -------------------------------------------------------------------------
    G1 = nx.Graph()
    arestas_g1 = [
        ("A", "B", 4.0), ("A", "C", 2.0), ("B", "C", 1.0),
        ("B", "D", 5.0), ("C", "D", 8.0), ("C", "E", 10.0),
        ("D", "E", 2.0)
    ]
    for u, v, w in arestas_g1:
        G1.add_edge(u, v, weight=w)

    esperado_g1 = {"A": 0.0, "B": 3.0, "C": 2.0, "D": 8.0, "E": 10.0}
    dist_eq1, _ = dijkstra_equipe(G1, "A")
    dist_nx1 = nx.single_source_dijkstra_path_length(G1, "A", weight="weight")

    ok1 = (dist_eq1 == esperado_g1 and dist_eq1 == dist_nx1)
    status1 = "OK" if ok1 else "DIVERGE"
    mensagens.append(f"Grafo de Teste 1 (5 vertices, resposta conhecida de livro): {status1}")
    if not ok1:
        sucesso_global = False

    # -------------------------------------------------------------------------
    # Teste 2: Grafo Diamante com Rota Alternativa (4 vertices, 5 arestas)
    # -------------------------------------------------------------------------
    G2 = nx.Graph()
    arestas_g2 = [
        ("S", "U", 1.0), ("S", "V", 4.0),
        ("U", "V", 2.0), ("U", "T", 6.0),
        ("V", "T", 3.0)
    ]
    for u, v, w in arestas_g2:
        G2.add_edge(u, v, weight=w)

    esperado_g2 = {"S": 0.0, "U": 1.0, "V": 3.0, "T": 6.0}
    dist_eq2, _ = dijkstra_equipe(G2, "S")
    dist_nx2 = nx.single_source_dijkstra_path_length(G2, "S", weight="weight")

    ok2 = (dist_eq2 == esperado_g2 and dist_eq2 == dist_nx2)
    status2 = "OK" if ok2 else "DIVERGE"
    mensagens.append(f"Grafo de Teste 2 (4 vertices, grafo diamante): {status2}")
    if not ok2:
        sucesso_global = False

    # -------------------------------------------------------------------------
    # Teste 3: Grafo Real do Vault do SAMU
    # -------------------------------------------------------------------------
    if origem_vault in G_vault:
        dist_eq_vault, _ = dijkstra_equipe(G_vault, origem_vault)
        dist_nx_vault = nx.single_source_dijkstra_path_length(G_vault, origem_vault, weight="weight")

        divergencias = []
        for no, d_ref in dist_nx_vault.items():
            d_calc = dist_eq_vault.get(no, float("inf"))
            if abs(d_calc - d_ref) > 1e-6:
                divergencias.append((no, d_ref, d_calc))

        ok_vault = (len(divergencias) == 0)
        status_vault = "OK" if ok_vault else "DIVERGE"
        mensagens.append(f"Grafo do Vault (Origem '{origem_vault}' vs NetworkX): {status_vault}")
        if not ok_vault:
            sucesso_global = False
            mensagens.append(f"  [DIVERGENCIAS]: {divergencias}")
    else:
        status_vault = "DIVERGE (Vertice de origem nao encontrado)"
        mensagens.append(f"Grafo do Vault: {status_vault}")
        sucesso_global = False

    return sucesso_global, mensagens


# ==============================================================================
# ETAPA 5: RESUMO EXECUTIVO E SALVAMENTO DE RESULTADOS
# ==============================================================================

def gerar_relatorio_resumo(
    G: nx.Graph,
    notas: Dict[str, Dict[str, Any]],
    links_quebrados: List[Tuple[str, str]],
    origem_socorro: str,
    tempo_exec_ms: float,
    status_verificacao: List[str],
    cidades_alvo: List[str]
) -> str:
    """
    Gera o texto estruturado do resumo executivo exigido pelo enunciado.
    """
    num_vertices = G.number_of_nodes()
    num_arestas = G.number_of_edges()
    orientado = G.is_directed()

    graus = [d for _, d in G.degree()]
    grau_min = min(graus) if graus else 0
    grau_max = max(graus) if graus else 0
    grau_medio = (sum(graus) / len(graus)) if graus else 0.0

    num_componentes = nx.number_connected_components(G)

    # Execucao do algoritmo da equipe para apresentacao
    distancias, predecessores = dijkstra_equipe(G, origem_socorro)

    linhas = []
    linhas.append("=" * 80)
    linhas.append("RESUMO DA ANALISE DE GRAFOS - MALHA SAMU 192 (IPORA - GO)")
    linhas.append("=" * 80)
    linhas.append(f"Diretorio Analisado      : [VAULT]")
    linhas.append(f"Numero de Vertices (|V|) : {num_vertices}")
    linhas.append(f"Numero de Arestas  (|E|) : {num_arestas}")
    linhas.append(f"Grafo Orientado          : {'Sim' if orientado else 'Nao (Nao-orientado / Bidirecional)'}")
    linhas.append(f"Grau Minimo              : {grau_min}")
    linhas.append(f"Grau Maximo              : {grau_max}")
    linhas.append(f"Grau Medio               : {grau_medio:.2f}")
    linhas.append(f"Componentes Conexos      : {num_componentes}")
    linhas.append("-" * 80)
    linhas.append("RELATORIO DE INTEGRIDADE DE LINKS:")
    if links_quebrados:
        linhas.append(f"[ALERTA] Foram encontrados {len(links_quebrados)} link(s) quebrado(s):")
        for src, dst in links_quebrados:
            linhas.append(f"  - Nota '{src}' aponta para nota inexistente: '[[{dst}]]'")
    else:
        linhas.append("  [OK] Nenhum link quebrado detectado (100% de integridade referencial).")
    linhas.append("-" * 80)
    linhas.append("VERIFICACAO DO ALGORITMO DA EQUIPE (DIJKSTRA vs REFERENCIA):")
    for msg in status_verificacao:
        linhas.append(f"  - {msg}")
    linhas.append(f"Tempo de Execucao do Dijkstra da Equipe: {tempo_exec_ms:.4f} ms")
    linhas.append("-" * 80)
    linhas.append(f"ROTAS DE DESPACHO USA-01 (CODIGO VERMELHO) A PARTIR DE '{origem_socorro}':")
    linhas.append(f"{'Municipio Destino':<22} | {'Distancia Calculada':<20} | {'Status SAMU Local':<20}")
    linhas.append("-" * 80)

    for cid in cidades_alvo:
        if cid in G:
            d = distancias.get(cid, float("inf"))
            meta_cid = notas.get(cid, {})
            status_local = meta_cid.get("status_samu", "Nao especificado")
            linhas.append(f"{cid:<22} | {d:6.1f} km             | {status_local:<20}")
        else:
            linhas.append(f"{cid:<22} | {'NAO ENCONTRADO':<20} | -")

    linhas.append("-" * 80)
    linhas.append("DETALHAMENTO DOS CAMINHOS MINIMOS ATE CADA MUNICIPIO:")
    for cid in cidades_alvo:
        if cid in G and cid != origem_socorro:
            caminho = reconstruir_caminho(predecessores, cid)
            # Simplifica caminho para legibilidade
            linhas.append(f"\n[Destino: {cid} | Distancia: {distancias.get(cid, 0):.1f} km]")
            linhas.append("  Rota: " + " -> ".join(caminho))

    linhas.append("\n" + "=" * 80)
    return "\n".join(linhas)


# ==============================================================================
# FUNCAO PRINCIPAL (ENTRY POINT)
# ==============================================================================

def main():
    """
    Funcao principal que orquestra a leitura do vault, montagem, analise e verificacao.
    """
    if len(sys.argv) < 2:
        print("[USO] python analise.py <diretorio_do_vault>")
        print("[EXEMPLO] python analise.py vault/")
        sys.exit(1)

    caminho_vault = sys.argv[1]

    if not os.path.exists(caminho_vault):
        print(f"[ERRO CRITICO] O caminho informado '{caminho_vault}' nao existe.", file=sys.stderr)
        sys.exit(1)

    # 1. Leitura do Vault
    try:
        notas, arestas, links_quebrados = carregar_vault(caminho_vault)
    except Exception as e:
        print(f"[ERRO FATAL] Falha no processamento do vault: {e}", file=sys.stderr)
        sys.exit(1)

    if not notas:
        print(f"[ERRO] Nenhuma nota .md valida encontrada no vault '{caminho_vault}'.", file=sys.stderr)
        sys.exit(1)

    # 2. Montagem do Grafo
    G = construir_grafo_malha(notas, arestas)

    # Vertice de Origem Central do SAMU
    origem_socorro = "Iporá"
    if origem_socorro not in G:
        # Fallback caso nome esteja sem acento
        for n in G.nodes:
            if "Ipora" in n or "Iporá" in n:
                origem_socorro = n
                break

    # 3. Execucao e Medicao de Tempo do Algoritmo da Equipe
    t_inicio = time.perf_counter()
    distancias_equipe, predecessores_equipe = dijkstra_equipe(G, origem_socorro)
    t_fim = time.perf_counter()
    tempo_exec_ms = (t_fim - t_inicio) * 1000.0

    # 4. Verificacao contra Referencia
    sucesso_testes, msgs_verificacao = executar_testes_verificacao(G, origem_socorro)

    # Lista dos 10 municipios da Microrregiao de Ipora
    cidades_alvo = [
        "Iporá", "Amorinópolis", "Israelândia", "Jaupaci",
        "Fazenda Nova", "Novo Brasil", "Córrego do Ouro",
        "Ivolândia", "Moiporá", "Cachoeira de Goiás"
    ]

    # 5. Geracao e Exibicao do Resumo
    resumo_texto = gerar_relatorio_resumo(
        G=G,
        notas=notas,
        links_quebrados=links_quebrados,
        origem_socorro=origem_socorro,
        tempo_exec_ms=tempo_exec_ms,
        status_verificacao=msgs_verificacao,
        cidades_alvo=cidades_alvo
    )

    # Impressao no terminal
    print(resumo_texto)

    # Salvamento em resultados.txt no diretorio de execucao corrente
    arquivo_saida = "resultados.txt"
    try:
        with open(arquivo_saida, "w", encoding="utf-8") as fs:
            fs.write(resumo_texto + "\n")
        print(f"\n[SUCESSO] Relatorio completo salvo em '{arquivo_saida}'.")
    except Exception as e:
        print(f"[AVISO] Nao foi possivel salvar '{arquivo_saida}': {e}", file=sys.stderr)

    if not sucesso_testes:
        print("\n[ALERTA] Pelo menos uma verificacao DIVERGIU da referencia!", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
