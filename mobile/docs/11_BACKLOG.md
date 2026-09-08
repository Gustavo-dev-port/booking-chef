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
6. [Épico 14 — Assinatura e Billing (parcialmente detalhado, decisão bloqueante em aberto)](#6-épico-14--assinatura-e-billing-parcialmente-detalhado-decisão-bloqueante-em-aberto)

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
- Assinatura e Billing (Épico 14, ver §6) — parcialmente detalhado, mas com decisão bloqueante de provedor de IAP ainda em aberto; nenhuma história dele compete por sprint até essa decisão ser tomada
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

## 6. Épico 14 — Assinatura e Billing (parcialmente detalhado, decisão bloqueante em aberto)

> **Origem:** achado ao verificar `docs/13_MONETIZACAO_VENDAS.md` contra o estado real do app — o documento descreve planos Free/Basic/Premium, limites e um funil de conversão, mas **nenhuma linha de código ou schema relacionada a plano/assinatura/pagamento existe hoje**: sem coluna de plano em `companies`, sem tabela de assinatura, sem SDK de pagamento, sem lógica de bloqueio em nenhuma tela. Este épico é essa lacuna, tratada como trabalho de verdade em vez de assumida como "só ligar depois".
>
> **Decisão bloqueante (spike necessário, mesmo padrão do Sprint 1 da V2 — `07_DATABASE.md`, Nota de arquitetura):** qual provedor de cobrança usar. Duas opções, sem decisão tomada ainda:
> - **Google Play Billing direto** — sem dependência de terceiro, mas exige implementar a lógica de validação de recibo/estado de assinatura na mão (webhook do Google, renovação, cancelamento, reembolso).
> - **RevenueCat (ou equivalente) sobre o Play Billing** — abstrai renovação/estado/analytics de assinatura, custo de engenharia menor, mas é mais uma dependência externa e um custo recorrente adicional (não elimina a taxa do Google, só some por cima dela — ver `13_MONETIZACAO_VENDAS.md` §4.1).
>
> Como só existe uma loja-alvo hoje (Play Store — não há build iOS neste projeto), a decisão não precisa resolver multi-plataforma ainda, o que simplifica a escolha em relação ao caso geral.

As histórias abaixo estão detalhadas até o ponto em que a decisão acima não interfere na estimativa — as que dependem diretamente do provedor escolhido ficam marcadas e sem story points.

| ID | História | Critério de aceite (resumo) | Prioridade | Story Points |
|---|---|---|---|---|
| 14.1 | Como sistema, preciso guardar qual plano cada empresa está (Free por padrão), para toda tela poder decidir o que mostrar/bloquear. | Campo de plano por empresa no schema, com migração de dados que classifica toda empresa existente antes do lançamento do paywall — nunca uma empresa já em uso vira Free por padrão no dia da ativação (ver nota de grandfathering abaixo). | Must | 5 |
| 14.2 | Como proprietário no plano Free, quero ver quantas fichas já usei do meu limite e ser bloqueado só de criar uma nova além dele, para entender por que fui parado sem perder o que já tenho. | Fichas já existentes continuam visíveis/editáveis mesmo acima do limite; só a criação de ficha nova é bloqueada; mensagem de upgrade amigável (`13_MONETIZACAO_VENDAS.md` §5.2), nunca punitiva. Conta só `products` com `type in ('bar','cozinha')` — ficha de cardápio digital legado (`type` nulo, criada antes do app mobile existir) não é "ficha técnica" pra esse limite, mesmo critério já usado na instrumentação de `first_product_created` (ver `src/features/recipes/api.ts`). | Must | 5 |
| 14.3 | Como sistema, preciso impedir um 2º/4º convite de funcionário além do limite do plano da empresa, para o limite de usuários (§2.3 do doc de monetização) valer de verdade. | Checagem dentro da Edge Function `invite-employee` (não só na interface) — mesmo padrão de "nunca só na tela" já usado em toda restrição de papel do Épico 08. | Must | 3 |
| 14.4 | Como sistema, preciso contar quantos PDFs de booking uma empresa Free já gerou no mês corrente, para aplicar o limite de 3/mês com marca d'água. | Contador reseta no início de cada mês civil; 4ª tentativa do mês oferece upgrade em vez de travar sem explicação. | Should | 3 |
| 14.5 | Como visitante no app, quero ver uma tela comparando Free/Basic/Premium e assinar um plano pago, para decidir e pagar sem sair do app. | Tela conforme mockup de `13_MONETIZACAO_VENDAS.md` §9; **story points e critério técnico de pagamento dependem da decisão bloqueante acima** — não estimável até lá. | Must | ❓ bloqueado |
| 14.6 | Como novo usuário, quero um trial Premium de 7 dias sem informar cartão, para experimentar antes de decidir, com downgrade automático pro Free no dia 8. | Processo agendado (job diário) faz o downgrade — infraestrutura que este projeto ainda não tem (sem cron/Edge Function agendada hoje); avisos nos dias 5/6/7 (`13_MONETIZACAO_VENDAS.md` §5.4). | Should | ❓ bloqueado (depende de 14.5) |
| 14.7 | Como empresa que já usava o app antes do paywall existir, quero manter acesso ao que já tinha (fichas, usuários, histórico) sem precisar pagar retroativo, para o lançamento da cobrança não quebrar quem já confiava no produto. | Migração de ativação do paywall classifica toda empresa pré-existente automaticamente no plano mínimo que já cobre o uso real dela (nunca abaixo do que ela já tem) — achado concreto: duas empresas em produção hoje já têm 93 e 22 fichas ativas, acima do limite Free de 15 (`13_MONETIZACAO_VENDAS.md` §3). | Must | 3 |
| 14.8 | Como responsável por produto, quero medir o funil de conversão descrito em `13_MONETIZACAO_VENDAS.md` §6, para decidir com dado real em vez de benchmark de mercado. | Eventos de "oferta Premium exibida" e "assinatura confirmada" gravados em `analytics_events` nos momentos certos — os eventos de topo de funil (`signup_completed`, `company_created`, `*_ingredient_created`, `*_product_created`, `login`) já foram instrumentados nesta mesma rodada (ver commit desta branch), mas o funil completo só fica medível quando os dois eventos de fundo de funil também existirem, o que depende de 14.5 estar no ar. | Should | 2 (+ os 2 eventos que faltam, sem custo adicional de schema — `analytics_events.event_name` precisa de um `ALTER` pra aceitar os dois valores novos) |

**Marco de saída do Épico 14:** só depois dele um plano pago pode ser cobrado de um cliente de verdade. Nenhuma outra história deste backlog depende dele — Estoque, CMV, Equipe e Produção já funcionam hoje sem paywall nenhum; o que muda é só a partir de quando (e para quem) esses recursos passam a exigir assinatura.
