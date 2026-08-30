---
documento: "11 — Backlog"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 11 — Backlog

## Índice

1. [Épicos concluídos (V1 — referência)](#1-épicos-concluídos-v1--referência)
2. [Épicos da V2 (detalhados nesta rodada)](#2-épicos-da-v2-detalhados-nesta-rodada)
3. [Épicos da V3 (não detalhados nesta rodada)](#3-épicos-da-v3-não-detalhados-nesta-rodada)
4. [Resumo MoSCoW](#4-resumo-moscow)
5. [Sprints](#5-sprints)

> Story points seguem escala Fibonacci (1, 2, 3, 5, 8, 13). Critérios de aceite completos, em formato BDD, estão em `12_CRITERIOS_ACEITE.md` — aqui cada história traz só o resumo do critério, para não duplicar o texto integral.

---

## 1. Épicos concluídos (V1 — referência)

| Épico | Escopo | Status |
|---|---|---|
| 01 — Autenticação | Login, cadastro, recuperação de senha, sessão segura | ✅ Concluído |
| 02 — Empresa e Onboarding | Cadastro do estabelecimento, busca de CNPJ, aceite de termos | ✅ Concluído |
| 03 — Fichas Técnicas | CRUD de fichas Bar/Cozinha, upload de foto, busca/filtro/ordenação | ✅ Concluído |
| 04 — Booking PDF | Geração de PDF com capa/sumário/rodapé, compartilhamento | ✅ Concluído |
| 05 — LGPD e Conta | Termos, política, exclusão de conta, preferência de tema | ✅ Concluído |

Mantidos aqui por rastreabilidade — não competem por sprint, já estão em produção.

## 2. Épicos da V2 (detalhados nesta rodada)

### Épico 06 — Estoque

| ID | História | Critério de aceite (resumo) | Prioridade | Story Points |
|---|---|---|---|---|
| 06.1 | Como proprietário, quero cadastrar um insumo (nome, categoria, unidade, quantidade mínima, fornecedor), para saber o que preciso repor. | Insumo salvo e listado; quantidade mínima aceita só valores ≥ 0. | Must | 5 |
| 06.2 | Como gerente, quero lançar uma movimentação (entrada, saída, ajuste, perda), para manter o saldo de estoque atualizado. | Saldo atualizado corretamente por tipo; movimentação nunca é apagada. | Must | 8 |
| 06.3 | Como proprietário, quero ver o histórico de movimentações de um insumo, para auditar o que aconteceu. | Lista cronológica, sem lacunas, com autor e data de cada lançamento. | Must | 3 |
| 06.4 | Como gerente, quero ver quais insumos estão abaixo da quantidade mínima, para saber o que comprar. | Lista/indicador atualiza automaticamente conforme o saldo muda. | Should | 3 |

### Épico 07 — CMV e Precificação

| ID | História | Critério de aceite (resumo) | Prioridade | Story Points |
|---|---|---|---|---|
| 07.1 | Como chef, quero selecionar um ingrediente do estoque na ficha técnica, para que unidade/custo/categoria sejam preenchidos automaticamente. | Ao selecionar, os três campos são preenchidos sem digitação manual; texto livre continua disponível como alternativa. | Must | 8 |
| 07.2 | Como chef, quero ver o custo total e o CMV% calculados em tempo real ao editar a ficha, para decidir o preço com dado real. | Recalcula a cada mudança de quantidade/ingrediente, sem precisar salvar antes. | Must | 5 |
| 07.3 | Como proprietário, quero que o custo calculado fique registrado historicamente, para comparar o custo de uma receita ao longo do tempo. | Snapshot gravado a cada salvamento da ficha; não recalculado retroativamente. | Must | 3 |
| 07.4 | Como proprietário, quero uma calculadora de preço sugerido a partir do CMV desejado, para não calcular na mão. | Três preços (mínimo/ideal/premium) exibidos, já com arredondamento comercial. | Should | 5 |

### Épico 08 — Equipe e Permissões

| ID | História | Critério de aceite (resumo) | Prioridade | Story Points |
|---|---|---|---|---|
| 08.1 | Como proprietário, quero convidar um funcionário por email com um cargo definido, para dar acesso controlado à equipe. | Convite enviado só ao email informado; papel definido no convite, nunca pelo convidado. | Must | 8 |
| 08.2 | Como funcionário convidado, quero criar minha senha a partir do link do convite, para acessar o app já vinculado à empresa certa. | Conta vinculada automaticamente ao estabelecimento e ao papel do convite. | Must | 3 |
| 08.3 | Como bartender/cozinheiro, quero ver só as telas do meu módulo, para não me confundir com o que não uso. | Navegação e RLS bloqueiam acesso fora do papel, inclusive por link direto. | Must | 5 |
| 08.4 | Como proprietário, quero remover o acesso de um funcionário, para revogar permissão quando necessário, sem apagar o que ele criou. | Acesso removido; fichas/movimentações da pessoa permanecem no histórico. | Should | 3 |

## 3. Épicos da V3 (não detalhados nesta rodada)

| Épico | Escopo | Motivo de não detalhar agora |
|---|---|---|
| 09 — Produção | Registro de produção, baixa automática de estoque | Depende da V2 (estoque + CMV) estar em uso real antes de detalhar histórias com precisão |
| 10 — Lista de Compras | Sugestão automática a partir de insumos críticos | Mesma dependência do Épico 09 |
| 11 — Dashboard e BI | Indicadores consolidados | Depende de volume de dado real de produção/estoque para os indicadores terem sentido |
| 12 — Offline First | SQLite, fila, sincronização, resolução de conflito | Módulo de risco técnico mais alto do roadmap — merece um documento de descoberta técnica dedicado antes de virar histórias de sprint |
| 13 — IA para Precificação | Sugestão assistida por modelo | Depende de decisão de produto ainda em aberto (`10_ROADMAP.md`, nota final) |

## 4. Resumo MoSCoW

### Must have

- 06.1 Cadastro de insumo · 06.2 Movimentação de estoque · 06.3 Histórico de movimentações
- 07.1 Seleção assistida de ingrediente · 07.2 Cálculo de custo/CMV em tempo real · 07.3 Snapshot de custo
- 08.1 Convite de funcionário · 08.2 Ativação de conta convidada · 08.3 Restrição de acesso por papel

### Should have

- 06.4 Alerta de insumo abaixo do mínimo
- 07.4 Calculadora de preço sugerido
- 08.4 Remoção de acesso de funcionário

### Could have

- Leitura de código de barras no cadastro de insumo
- Edição de papel de um funcionário já ativo (troca de cargo pós-convite)
- Exportação do histórico de movimentações em CSV

### Won't have (neste ciclo)

- Produção, Lista de Compras, Dashboard, Offline First, IA para Precificação (Épicos 09–13, ver §3)
- PDV, módulo fiscal, delivery, financeiro completo (fora do escopo do produto — `01_PRD.md`, §12)

## 5. Sprints

Sprints de 2 semanas; capacidade de referência ~18–20 story points/sprint (ajustar conforme o tamanho real do time alocado).

| Sprint | Objetivo | Histórias | Story Points |
|---|---|---|---|
| **Sprint 1** | Base do estoque | Spike: decisão de arquitetura (`07_DATABASE.md`, Nota de arquitetura) — sem story points, é pré-requisito bloqueante · 06.1 · 06.4 | 8 |
| **Sprint 2** | Estoque operacional completo | 06.2 · 06.3 | 11 |
| **Sprint 3** | CMV em tempo real | 07.1 · 07.2 | 13 |
| **Sprint 4** | Precificação + início de Equipe | 07.3 · 07.4 · 08.1 | 16 |
| **Sprint 5** | Equipe completa + fechamento da V2 | 08.2 · 08.3 · 08.4 · regressão e QA de ponta a ponta da V2 | 11 |

**Marco de saída da V2:** ao final do Sprint 5, um estabelecimento piloto deve conseguir cadastrar insumos, vincular ingredientes na ficha técnica, ver CMV em tempo real, consultar preço sugerido, e convidar/gerenciar ao menos um funcionário com papel restrito — validando o objetivo da V2 registrado em `10_ROADMAP.md`.
