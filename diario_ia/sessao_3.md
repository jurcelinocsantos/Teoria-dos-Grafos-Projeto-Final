# Diário de Bordo - Sessão 3

* **Data:** 23/11/2026
* **Ferramenta:** Antigravity e NotebookLM / Gemini 3.8 Flash

### O que a gente perguntou / Resumo da conversa
Chegou a fase da programação e, como a gente preferiu que a IA fizesse os códigos sozinha, pedimos para ela gerar o script completo (`analise.py`), o arquivo de dependências (`requirements.txt`) e o `README.md` a partir do vault do Obsidian que tínhamos montado. Passamos os requisitos do trabalho: leitor manual dos arquivos Markdown sem biblioteca pronta, montagem do grafo ponderado, implementação própria do algoritmo de Dijkstra (sem chamar função pronta de biblioteca) e a rotina de teste comparativo contra o NetworkX.

### O que a IA respondeu de útil
A IA gerou todo o código em Python sozinha. Ela escreveu o parser com regex para limpar os links `[[nota|texto]]` e `[[nota#seção]]`, montou a estrutura do grafo com as distâncias das rodovias, implementou o algoritmo de Dijkstra na mão usando a fila de prioridade com `heapq` ($O((V+E) \log V)$) e deixou pronta a verificação contra a biblioteca de referência e o salvamento em `resultados.txt`.

### O que estava errado ou a gente verificou
Mesmo a IA tendo feito o código todo sozinha, a gente foi rodar para auditar e na hora bateu o olho num erro feio: o algoritmo estava dizendo que a distância de Iporá até cidades bem longe (como Cachoeira de Goiás e Córrego do Ouro) era de apenas 2 km! 
Avaliando a saída, a gente descobriu o motivo: as notas de texto e regras médicas (`Protocolo Código Vermelho` e `Matriz de Trafegabilidade`) estavam com links azuis em colchetes para as cidades. Como o grafo não é orientado, o código da IA achou um atalho "voando" por dentro da nota de texto com peso de 1 km, contornando a estrada real.

### O que a equipe fez com isso
A gente identificou a falha no teste e corrigiu as notas: removemos os colchetes dos links dessas notas de texto e deixamos apenas os nomes em negrito. Rodamos o script de novo e aí sim funcionou perfeitamente: 109 km para Cachoeira de Goiás, 104 km para Córrego do Ouro, 96 km para Novo Brasil, etc., tudo passando rigorosamente pelas rodovias. O teste final retornou `OK` em tudo.
