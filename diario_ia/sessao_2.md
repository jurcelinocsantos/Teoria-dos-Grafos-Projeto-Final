# Diário de Bordo - Sessão 2

* **Data:** 16/11/2026
* **Ferramenta:** NotebookLM / Gemini 3.8 Flash

### O que a gente perguntou / Resumo da conversa
A gente pediu para a IA encontrar a quilometragem (KM) e os entroncamentos de cada trecho de rodovia estadual (GO) da microrregião de Iporá e para quais municípios cada uma ia. Depois que rascunhamos as notas, pedimos também para ela conferir o vault do Obsidian e ela deu uma pequena corrigida na estrutura das notas.

### O que a IA respondeu de útil
Ela listou as rodovias que cortam a região (GO-060, GO-174, GO-320, GO-173, GO-326, GO-164 e GO-444), mapeou os entroncamentos principais e estimou os KMs de cada pedaço de estrada (como os 27 km de Iporá a Amorinópolis pela GO-174, os trechos da GO-060 e da GO-173). Na conferência do vault, ela ajudou a padronizar alguns nomes de notas e apontou pequenos ajustes de formatação nos links.

### O que estava errado ou a gente verificou
A gente fez duas checagens importantes por conta própria:
1. **Dados do SAMU:** Fomos verificar no CNES (Datasus) a situação de cada cidade e confirmamos que só Iporá tem a USA (UTI Móvel), Fazenda Nova e Ivolândia têm bases com USB, Cachoeira de Goiás recebeu uma USB recente, e as outras 6 cidades não possuem base física.
2. **Regra de Conexão no Grafo:** Conferimos se na revisão a IA não tinha deixado nenhuma cidade ligada direto na outra. A nossa regra de modelagem era clara: nenhuma cidade podia ter link direto com outra cidade; toda rota de socorro precisa obrigatoriamente passar pelos trechos de asfalto e pelos entroncamentos reais.

### O que a equipe fez com isso
A gente aceitou as correções da IA no vault, colocou os KMs exatos no cabeçalho de cada trecho rodoviário e garantiu que toda a malha ficasse conectada estritamente nó a nó (Cidade $\rightarrow$ Rodovia $\rightarrow$ Entroncamento). Também acrescentamos informações práticas sobre o asfalto e os horários de pico nas estradas.
