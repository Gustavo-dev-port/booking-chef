---
documento: "01 — PRD (Product Requirements Document)"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
status: "V1 implementada e validada · V2/V3 em planejamento"
---

# 01 — PRD (Product Requirements Document)

## Índice

1. [Visão](#1-visão)
2. [Missão](#2-missão)
3. [Problema](#3-problema)
4. [Solução](#4-solução)
5. [Público-alvo](#5-público-alvo)
6. [Mercado](#6-mercado)
7. [Diferenciais](#7-diferenciais)
8. [Objetivos SMART](#8-objetivos-smart)
9. [KPIs](#9-kpis)
10. [MVP](#10-mvp)
11. [Escopo](#11-escopo)
12. [Fora do escopo](#12-fora-do-escopo)
13. [Casos de uso](#13-casos-de-uso)

> **Nota de rastreabilidade:** este PRD descreve o produto Booking Chef em sua visão completa (V1 a V3). A V1 aqui descrita **já está implementada e validada** — código real, banco real, testes passando — sob o nome de projeto `mobile/` (documentada tecnicamente em `mobile/docs/DOCUMENTACAO-BOOKING-CHEF.md`). V2 e V3 são planejamento. Onde este documento e o histórico de decisões do projeto divergem em algum detalhe, isso é sinalizado explicitamente em vez de escondido — ver §12.

---

## 1. Visão

Ser o sistema de retaguarda operacional (*back-of-house*) padrão para bares, restaurantes, cafeterias e hamburguerias de pequeno e médio porte — o lugar único onde a casa organiza suas fichas técnicas, controla o custo real do que vende e gerencia seu estoque, substituindo cadernos, planilhas soltas e a memória de quem cozinha.

## 2. Missão

Dar a donos e equipes de cozinha e bar, mesmo sem afinidade tecnológica, uma ferramenta mobile simples o suficiente para usar no meio do turno, e completa o suficiente para responder, com dados reais, três perguntas que hoje raramente têm resposta confiável: *"quanto essa receita custa de verdade?"*, *"o que está faltando no estoque?"* e *"por quanto eu deveria vender isso?"*.

## 3. Problema

| Sintoma observado no dia a dia do estabelecimento | Causa raiz |
|---|---|
| Ficha técnica em caderno, planilha solta, ou só na cabeça de quem cozinha | Nenhuma ferramenta pensada para quem não é usuário avançado de planilha, no ritmo de uma cozinha/bar |
| Preço de venda decidido "no olho" | Custo de receita nunca foi calculado de forma consistente e atualizada |
| Estoque contado de cabeça, ou não contado | Controle de estoque genérico (de ERP completo) é complexo demais para o porte do negócio |
| Treinar um funcionário novo depende de alguém explicar pessoalmente | Não existe um material de referência padronizado e atualizado da casa |
| Compra de insumo decidida por "achismo" | Sem visibilidade de saldo mínimo nem de consumo real por receita |

## 4. Solução

Um aplicativo mobile (Android, com iOS planejado) que organiza o back-of-house em módulos que se conectam pelo mesmo dado central — a ficha técnica —, evoluindo em três fases:

- **V1 (implementada):** fichas técnicas de Bar e Cozinha, com ingrediente em texto livre, e geração de booking em PDF para impressão/treinamento. Cadastro do estabelecimento e login seguro incluídos.
- **V2 (planejada):** estoque conectado às fichas, CMV automático em tempo real, preço sugerido, e múltiplos usuários por estabelecimento com permissões (RBAC).
- **V3 (planejada):** lista de compras, registro de produção (o que efetivamente foi preparado, consumindo estoque), dashboard de indicadores, funcionamento offline-first, e precificação assistida por IA.

## 5. Público-alvo

Proprietários, chefs, bartenders, gerentes e cozinheiros de estabelecimentos de pequeno e médio porte — bares, restaurantes, cafeterias, hamburguerias, pizzarias, adegas, food trucks e casas noturnas —, com **prioridade explícita para pessoas com pouca afinidade tecnológica**. Ver personas completas em `02_PERSONAS.md`.

## 6. Mercado

O produto se posiciona no espaço de *back-of-house management* para food service independente — a faixa de estabelecimentos pequena e média demais para justificar um ERP gastronômico completo (com PDV, módulo fiscal, delivery e financeiro integrados), mas que ainda assim precisa de controle de custo e estoque tão rigoroso quanto uma rede maior. Essa faixa hoje resolve o problema com uma combinação de caderno, planilha genérica e, no melhor caso, um módulo de estoque dentro de um PDV que não foi desenhado pensando em ficha técnica como o dado central.

**Hipótese de mercado (a validar com dados de aquisição reais, não uma cifra de terceiros citada sem fonte):** o volume de bares e restaurantes independentes no Brasil é numeroso o suficiente para sustentar um produto de nicho vertical bem executado; a validação de tamanho de mercado endereçável deve ser tratada como uma tarefa de descoberta contínua (pesquisa com o público-alvo, dados de conversão do próprio funil), não uma suposição fixada neste documento.

## 7. Diferenciais

- **Ficha técnica como dado central**, não um módulo entre outros — todo o resto do produto (booking, estoque, CMV, produção) se conecta a ela, em vez de ser um sistema genérico de estoque com fichas "penduradas" por cima.
- **Ingrediente em texto livre na V1**, sem exigir cadastro prévio de insumo — o produto não impõe a complexidade de estoque a quem só quer organizar receitas. A ponte para custo/CMV (V2) já existe desde a V1 via conciliação automática em segundo plano.
- **Booking em PDF como recurso de primeira classe**, não um "exportar" genérico — capa, sumário, uma ficha por página, pronto para impressão e treinamento de equipe.
- **UX desenhada para quem não é usuário avançado de tecnologia** — heurísticas de Nielsen aplicadas rigorosamente (ver `04_UX_GUIDELINES.md`), vocabulário do estabelecimento, nunca vocabulário de banco de dados.
- **Base já validada em produção**, não uma ideia em papel — a V1 roda sobre um backend (Supabase) com isolamento entre estabelecimentos já testado com dados reais.

## 8. Objetivos SMART

| Objetivo | Específico | Mensurável | Alcançável | Relevante | Temporal |
|---|---|---|---|---|---|
| Adoção inicial | Estabelecimentos ativos usando fichas técnicas no app | 50 estabelecimentos com ≥ 1 ficha cadastrada | Sim, dado o escopo enxuto da V1 | Valida a proposta de valor central antes de investir em V2 | Nos primeiros 90 dias após disponibilização pública |
| Retenção de uso | Estabelecimentos que voltam a abrir o app após a primeira semana | ≥ 40% de retorno em D+7 | Sim, para um produto de uso operacional diário/semanal | Retenção baixa indicaria fricção de UX ou falta de valor percebido | Medido continuamente a partir do lançamento |
| Geração de booking | Estabelecimentos que geram ao menos um PDF de booking | ≥ 60% dos estabelecimentos ativos | Sim, é o diferencial de maior visibilidade do produto | Valida se o recurso mais promovido é de fato usado | Nos primeiros 30 dias de uso de cada estabelecimento |
| Evolução para V2 | Lançar estoque + CMV automático | Módulo em produção, com ao menos 1 estabelecimento piloto operando CMV em tempo real | Sim, dependente da V1 estar estável | Sem isso o produto não avança da "ficha digital" para "ferramenta de gestão" | Em até 2 trimestres após a estabilização da V1 |

## 9. KPIs

| KPI | O que mede | Onde é coletado |
|---|---|---|
| Estabelecimentos ativos (MAU de conta, não de usuário) | Adoção real do produto | `analytics_events` (evento `login`, agregado por `company_id`) |
| Fichas técnicas criadas por estabelecimento | Profundidade de uso do recurso central | Contagem de `products` ativos com `type` preenchido, por `company_id` |
| Taxa de geração de booking | Uso do diferencial competitivo | Evento dedicado a implementar (`booking_generated`) — hoje o app ainda não emite esse evento, ver `10_ROADMAP.md` |
| Tempo até a primeira ficha criada | Fricção do onboarding | `analytics_events` (`first_product_created` já existe no schema, ver `07_DATABASE.md`) |
| CMV médio calculado (pós-V2) | Adoção do valor de gestão de custo, não só de catálogo | Agregação de `recipe_cost_snapshot` |
| Churn de conta (cancelamento/abandono) | Saúde de retenção de longo prazo | A definir — depende de instrumentação adicional |

## 10. MVP

O MVP **é a V1**, já implementada: cadastro do estabelecimento, login seguro, gestão de fichas técnicas (Bar e Cozinha), geração de booking em PDF, conformidade com LGPD (consentimento, política, exclusão de conta) e UX orientada pelas heurísticas de Nielsen. Detalhamento técnico completo em `06_ARQUITETURA.md` e `mobile/docs/DOCUMENTACAO-BOOKING-CHEF.md`.

## 11. Escopo

**V1 (implementada):** autenticação, cadastro de estabelecimento (com preenchimento automático de CNPJ), fichas técnicas de Bar e Cozinha (com foto), booking em PDF, preferência de tema claro/escuro, LGPD completa.

**V2 (planejada):** estoque de insumos conectado às fichas, movimentações com histórico, CMV automático em tempo real, calculadora de preço sugerido, múltiplos usuários por estabelecimento com RBAC (Proprietário/Gerente/Bartender/Cozinheiro/Visualizador), convite de funcionário.

**V3 (planejada):** lista de compras, registro de produção (baixa de estoque por receita efetivamente preparada), dashboard de indicadores, funcionamento offline-first com sincronização, precificação assistida por IA.

## 12. Fora do escopo

Para manter a disciplina do produto — a mesma disciplina que já orienta as decisões técnicas documentadas ao longo deste pacote —, os itens abaixo **não fazem parte de nenhuma das três versões planejadas**, mesmo sendo comuns em ERPs de gastronomia genéricos:

- **PDV (ponto de venda)** — o Booking Chef não processa vendas nem se integra a maquininha de cartão.
- **Módulo fiscal** — emissão de nota fiscal, NFC-e, integração com SEFAZ.
- **Delivery** — integração com iFood, Rappi ou aplicativos próprios de pedido.
- **Financeiro completo** — contas a pagar/receber, fluxo de caixa, conciliação bancária. O CMV e o preço sugerido (V2) são recursos de **precificação de receita**, não um módulo financeiro.
- **CRM de clientes** — cadastro de cliente final, programa de fidelidade, marketing.

> Esta lista existe para que "ERP gastronômico modular" (a ambição de longo prazo do produto) não seja lida como "vamos construir tudo o que um ERP de gastronomia genérico tem". O Booking Chef é modular **dentro do escopo de retaguarda operacional** (ficha técnica → estoque → custo → produção) — os itens acima ficam deliberadamente para fora, permanentemente, a menos que uma decisão de produto futura mude esse limite de propósito e este documento seja atualizado para refletir isso.

## 13. Casos de uso

| # | Caso de uso | Ator | Pré-condição | Resultado esperado |
|---|---|---|---|---|
| CU-01 | Cadastrar o estabelecimento | Proprietário | Conta criada, sem empresa vinculada ainda | Estabelecimento criado, proprietário vinculado, app liberado |
| CU-02 | Criar ficha técnica de drink | Bartender / Proprietário | Sessão ativa, estabelecimento cadastrado | Ficha salva no módulo Bar, disponível na lista e no booking |
| CU-03 | Criar ficha técnica de prato | Cozinheiro / Chef | Sessão ativa, estabelecimento cadastrado | Ficha salva no módulo Cozinha |
| CU-04 | Gerar booking para impressão | Gerente / Proprietário | Ao menos uma ficha ativa no módulo escolhido | PDF gerado com capa, sumário e uma ficha por página |
| CU-05 | Recuperar acesso à conta | Qualquer usuário | Conta existente, senha esquecida | Nova senha definida via link de email |
| CU-06 (V2) | Vincular ingrediente ao estoque numa ficha | Chef / Cozinheiro | Estoque cadastrado, ingrediente existente no catálogo | Unidade e custo preenchidos automaticamente; CMV recalculado |
| CU-07 (V2) | Consultar preço sugerido de uma receita | Proprietário | Ficha com custo calculado | Preço mínimo, ideal e premium exibidos, com arredondamento comercial |
| CU-08 (V2) | Convidar um funcionário | Proprietário / Gerente | Estabelecimento cadastrado | Funcionário recebe convite, cria senha, acessa com o papel definido |
| CU-09 (V3) | Registrar uma produção | Cozinheiro / Bartender | Ficha técnica vinculada ao estoque | Estoque de insumos baixado automaticamente pela quantidade da receita |
| CU-10 (V3) | Consultar o dashboard | Proprietário / Gerente | Estoque e fichas com dados suficientes | Indicadores de valor de estoque, CMV médio, produtos críticos e receita mais lucrativa exibidos |
