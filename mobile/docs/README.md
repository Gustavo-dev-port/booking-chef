---
documento: "README — Índice da documentação"
produto: "Booking Chef"
versão: "1.2"
data: "8 de setembro de 2026"
---

# Booking Chef — Documentação do Produto (`docs/`)

**Versão do pacote:** 1.2 · **Data:** 8 de setembro de 2026 · **Status da V1:** implementada e validada em produção · **Status da V2:** implementada e mergeada em `master` (Estoque, CMV/Precificação, Equipe/Permissões) · **V3:** iniciada (Épico 09 — Produção, PR aberto) — demais épicos planejados

Esta pasta contém a documentação completa do Booking Chef, no nível de detalhe usado por uma equipe multidisciplinar (Product, Arquitetura, UX, Engenharia Mobile, Banco de Dados, Segurança/LGPD e Tech Writing) para iniciar e conduzir o desenvolvimento de um produto de qualidade de startup.

## Como ler este pacote

Cada documento é independente e citável isoladamente, mas a leitura em ordem numérica segue o fluxo natural de um planejamento de produto: **por que construir → para quem → como o usuário navega → como a interface se comporta → como ela é construída tecnicamente → onde o dado mora → como os módulos se falam → como o dado é protegido → para onde o produto vai → o que fazer primeiro → como saber que está pronto → como o produto se sustenta financeiramente.**

| # | Documento | Conteúdo |
|---|---|---|
| — | [README.md](./README.md) | Este índice |
| 01 | [01_PRD.md](./01_PRD.md) | Visão, missão, problema, solução, público, mercado, diferenciais, objetivos SMART, KPIs, MVP, escopo e fora de escopo, casos de uso |
| 02 | [02_PERSONAS.md](./02_PERSONAS.md) | 5 personas completas (Proprietário, Chef, Bartender, Gerente, Cozinheiro) |
| 03 | [03_JORNADA_USUARIO.md](./03_JORNADA_USUARIO.md) | 10 fluxogramas Mermaid — das jornadas já implementadas às planejadas |
| 04 | [04_UX_GUIDELINES.md](./04_UX_GUIDELINES.md) | As 10 heurísticas de Nielsen aplicadas, telas com wireframes ASCII, CTAs, estados e acessibilidade |
| 05 | [05_DESIGN_SYSTEM.md](./05_DESIGN_SYSTEM.md) | Cores, tipografia, espaçamento (base 8) e catálogo de componentes |
| 06 | [06_ARQUITETURA.md](./06_ARQUITETURA.md) | Stack, estrutura de pastas, autenticação, estado, upload de imagem, geração de PDF, offline sync |
| 07 | [07_DATABASE.md](./07_DATABASE.md) | Modelagem completa (Fases 1–3), campo a campo, com DER em Mermaid |
| 08 | [08_API.md](./08_API.md) | Contrato de dados estilo REST sobre o Supabase — request/response/erros/permissões |
| 09 | [09_SEGURANCA_LGPD.md](./09_SEGURANCA_LGPD.md) | LGPD, criptografia, hash de senha, JWT, RLS, auditoria e matriz RBAC completa |
| 10 | [10_ROADMAP.md](./10_ROADMAP.md) | V1 (entregue), V2 e V3, com objetivo, valor entregue, tempo estimado e dependências |
| 11 | [11_BACKLOG.md](./11_BACKLOG.md) | Épicos, histórias, prioridade MoSCoW e estimativa em story points, organizados em 5 sprints |
| 12 | [12_CRITERIOS_ACEITE.md](./12_CRITERIOS_ACEITE.md) | Critérios de aceite em formato BDD (Dado/Quando/Então) para cada funcionalidade |
| 13 | [13_MONETIZACAO_VENDAS.md](./13_MONETIZACAO_VENDAS.md) | Plano de monetização por assinatura (v1.1): mercado, planos Free/Basic/Premium, precificação já líquida da taxa do Google Play, freemium, funil, lançamento em 90 dias, projeção de receita recorrente e conclusão estratégica |

## Relação com a documentação técnica já existente

Este pacote **coexiste** com `mobile/docs/DOCUMENTACAO-BOOKING-CHEF.md`, publicado anteriormente. Os dois têm propósitos diferentes e não competem entre si:

- **`DOCUMENTACAO-BOOKING-CHEF.md`** é a referência técnica única, escrita a partir do código real da V1 — o documento certo para um desenvolvedor entender exatamente como o app funciona hoje, campo a campo, arquivo a arquivo.
- **Este pacote (`docs/`)** é o conjunto de planejamento de produto no formato de 12 documentos especializados, cobrindo desde a visão de negócio até o backlog em sprints — o conjunto certo para onboarding de um novo membro de equipe, apresentação a um investidor, ou planejamento da V2/V3.

Onde os dois descrevem a mesma coisa (por exemplo, o schema de banco da V1, ou o fluxo de autenticação), as informações foram checadas contra o mesmo código-fonte e o mesmo schema real do Supabase (`barcontrol-dev`) — não são duas versões divergentes da verdade, são dois níveis de detalhe sobre a mesma verdade.

## Rastreabilidade de status

Ao longo de todo o pacote, cada funcionalidade é marcada com seu status real. Convenção de 4 estados (adotada a partir de `13_MONETIZACAO_VENDAS.md` e já retroaplicada onde fazia diferença prática):

- **✅ Implementado** — existe em código, testado, em produção/`master`.
- **🚧 Em desenvolvimento** — código existe (branch ou PR aberto), ainda não mergeado.
- **🔜 Planejado** — desenhado neste pacote, desenvolvimento ainda não iniciado.
- **💡 Novo** — proposto por algum documento do pacote, ainda não existe em nenhum backlog — precisa virar história aprovada antes de virar compromisso de prazo.

Isso é deliberado: um documento que não distingue "o que já existe" de "o que ainda é plano" convida a decisões erradas. Sempre que uma nova fase entrar em desenvolvimento (ou um PR for mergeado), os documentos afetados devem ser atualizados pra mover os itens correspondentes entre esses estados, refletindo o schema e o código reais no momento — a mesma disciplina já seguida em `DOCUMENTACAO-BOOKING-CHEF.md`. Achado real que motivou formalizar isso aqui: `13_MONETIZACAO_VENDAS.md` v1.0 ficou desatualizado um dia depois de escrito porque o merge de PRs #5–#7 aconteceu antes do documento ser revisado — ver Controle de versão abaixo.

## Decisão de arquitetura pendente (leitura obrigatória antes de iniciar a V2)

Antes de qualquer linha de código da V2, `07_DATABASE.md` (seção "Nota de arquitetura") e `11_BACKLOG.md` (Sprint 1) registram uma decisão bloqueante: avaliar se as tabelas novas de estoque e equipe devem reaproveitar o catálogo `ingredients` e o vínculo `company_users` já existentes no banco real, em vez de nascer como tabelas paralelas e desconectadas. Essa decisão muda a estimativa de esforço da V2 e deve ser tomada e documentada antes do Sprint 1 começar de fato.

## Controle de versão

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | 30 de agosto de 2026 | Primeira versão do pacote completo de 12 documentos + README, cobrindo V1 (implementada) e V2/V3 (planejadas). |
| 1.1 | 7 de setembro de 2026 | Adicionado `13_MONETIZACAO_VENDAS.md` — plano de monetização e vendas por assinatura, mesclado com o restante do pacote e com o estado real de desenvolvimento (Estoque/Equipe em desenvolvimento avançado na branch `v2-estoque-compra-uso`; CMV automático e preço sugerido ainda não implementados). |
| 1.2 | 8 de setembro de 2026 | Correção estrutural, um dia depois: PRs #5–#7 mergearam V2 inteira (Estoque, CMV, Precificação, Equipe) em `master` no mesmo dia da v1.1, tornando a nota acima desatualizada — `13_MONETIZACAO_VENDAS.md` revisado pra v1.1 (status ✅ corrigido, taxa do Google Play Billing entrando nas contas de MRR/ARR, achado real de empresas já acima do limite Free, Épico 14 — Assinatura e Billing — adicionado a `11_BACKLOG.md`). `09_SEGURANCA_LGPD.md` ganhou uma seção nova sobre dado de assinatura/pagamento. Convenção de status deste README passou de 2 pra 4 estados (✅/🚧/🔜/💡), pra evitar a mesma classe de desatualização se repetir. |
