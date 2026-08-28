# Estoque & Ficha Técnica — FASE 1: Arquitetura e Planejamento

> Documento de planejamento. Nenhum código de implementação, migration, policy real ou dependência foi criado nesta fase — apenas arquitetura, banco de dados e fluxos.
>
> **Revisão 2** (2026-08-15): ajustes de arquitetura, banco de dados e segurança aplicados antes do início da Fase 2. Ver changelog ao final do documento.
>
> **Revisão 3** (2026-08-28): três campos de evolução futura (`prep_time_minutes`, `version`, `created_by`) adicionados à tabela `products` — aplicados diretamente no projeto Supabase real (`barcontrol-dev`), ainda sem uso na interface. Ver seção 5.1, nota após 5.3 e changelog. **Nota de contexto:** este documento não reflete tudo que já existe no banco real hoje — o schema de "cardápio digital" (`description`, `tags`, `is_featured`, `sort_order`, `slug` em `products`, tabela `edge_rate_limits`, function `garcom-ai`) foi implementado depois da Revisão 2 e ainda não foi retro-documentado aqui.

---

## 1. Resumo do produto

Um aplicativo web (PWA), gratuito e mobile-first, para pequenos bares, restaurantes, lanchonetes, hamburguerias, pizzarias, adegas, cafeterias e casas noturnas resolverem dois problemas específicos: contar o estoque rapidamente pelo celular e calcular o custo real de cada produto vendido através de fichas técnicas ligadas aos insumos. Não é um ERP: não há PDV, comandas, fiscal, delivery ou financeiro. A promessa é "abri, contei, calculei e terminei".

## 2. Escopo do MVP

**Entra no MVP**

| Área | O que entra |
|---|---|
| Onboarding | Criação de conta, cadastro da empresa (CNPJ com campo preparado para consulta futura), segmento, tamanho do negócio, função do usuário, aceite de termos e opt-in de marketing separado |
| Insumos | CRUD de insumos, categorias (padrão + personalizadas), unidades de compra/uso com conversão, cálculo automático de custo unitário |
| Produtos / Ficha técnica | CRUD de produtos, montagem de ficha técnica por ingredientes, cálculo automático de custo total, custo percentual e margem bruta, atualização em cascata quando o preço de um insumo muda |
| Estoque | Visualização do **último estoque contado**, valor financeiro aproximado |
| Contagem | Modo "Nova contagem" item a item, contagem fracionada de garrafas abertas (25/50/75/100%), finalização com resumo |
| Histórico | Registro de todas as contagens, comparação entre contagem anterior e atual (sem inferir venda/perda) |
| Busca | Busca instantânea em insumos e produtos |
| Admin interno | Estrutura preparada para painel administrativo separado (não acessível a clientes) e eventos de analytics para funil de ativação |

**Não entra no MVP** (explicitamente fora de escopo): PDV, emissão de NFC-e, integração fiscal, delivery/iFood, comandas, mesas, pedidos, fluxo de caixa completo, folha de pagamento, CRM, controle financeiro complexo, integração com maquininhas, inteligência artificial, integração com WhatsApp, marketplace, controle avançado de fornecedores, paywall/checkout/assinatura.

**Nota conceitual — "estoque" não é tempo real.** Como o MVP não tem PDV nem movimentações automáticas de entrada/saída, o sistema nunca sabe o estoque exato no momento em que alguém consulta a tela. O que existe é sempre uma fotografia de uma contagem manual feita em determinada data e hora. Por isso a interface e a documentação evitam o termo "Estoque Atual" (ver Ajuste 7, seção de changelog) e usam "Última contagem" / "último estoque contado".

## 3. Jornada do usuário

**Onboarding (primeira vez)**

```
Landing/Login
   ↓
Etapa 1 — Criação da conta (nome, e-mail, telefone, senha)
   ↓
Etapa 2 — Cadastro do estabelecimento (CNPJ → razão social, nome fantasia, cidade, estado)
   ↓
Etapa 3 — Segmento (bar, restaurante, hamburgueria, ...)
   ↓
Etapa 4 — Tamanho do negócio (nº de pessoas)
   ↓
Etapa 5 — Função do usuário (proprietário, gerente, ...)
   ↓
Termos de uso (obrigatório) + opt-in de marketing (opcional, desmarcado)
   ↓
Dashboard
```

**Uso recorrente**

```
Dashboard (mostra a Última Contagem, não um "estoque em tempo real")
   ↓
Insumos → cadastrar/editar insumo → custo unitário calculado
   ↓
Produtos → nova ficha técnica → seleciona insumos + quantidades → custo, % e margem calculados
   ↓
Estoque → Nova contagem → item a item (inteiro ou fracionado) → resumo → salva
   ↓
Histórico → lista de contagens → comparação entre duas contagens
```

## 4. Arquitetura

**Front-end**
- Next.js (App Router) + TypeScript + Tailwind CSS.
- PWA: manifest.json + service worker (cache de shell da aplicação, instalável em Android/iPhone/desktop). O service worker não deve cachear respostas autenticadas com dados sensíveis (ver Ajuste 8, etapa M0.6).
- React Hook Form + Zod para formulários e validação client-side.
- TanStack Query para cache e sincronização dos dados vindos do Supabase (contagens, insumos, fichas técnicas).
- Zustand (ou equivalente leve) apenas para estado efêmero de UI, como o fluxo de "Nova contagem" andando item a item.
- Componentização por domínio (ver seção 6), sem lógica de negócio dentro de `page.tsx`.

**Backend**
- Supabase como backend único: PostgreSQL, Supabase Auth (e-mail/senha nesta fase, com arquitetura pronta para OAuth Google depois), Row Level Security em todas as tabelas multi-tenant, Storage reservado para uso futuro (ex.: foto de insumo).
- Regras de negócio sensíveis (ex.: recomputar custo de ficha técnica) resolvidas via consulta relacional (join/view) no Postgres, nunca copiando valores para o front.
- Server Actions / Route Handlers do Next.js como camada intermediária para validação server-side com Zod antes de qualquer escrita, evitando depender só do RLS.
- Ponto de extensão futuro: Edge Function ou API route para consulta de CNPJ em serviço público (não implementado nesta fase, apenas o campo preparado no formulário).

**Autenticação (atualizado — Ajuste 3)**
- Usar exclusivamente **Supabase Auth**, sem sistema de autenticação próprio, sem gerenciamento manual de tokens e sem senha armazenada em tabela própria.
- Integração via `@supabase/ssr`, com dois clientes distintos:
  - **Cliente de browser** — usado em Client Components, criado com a URL pública e a publishable key.
  - **Cliente de servidor** — usado em Server Components, Server Actions e Route Handlers, criado a partir dos cookies da requisição.
- A sessão é baseada em cookies gerenciados pelo próprio `@supabase/ssr`. O documento não fixa antecipadamente detalhes como flags de cookie (`HttpOnly`, `SameSite`, etc.) — isso segue o comportamento e as recomendações oficiais da biblioteca no momento da implementação, em vez de uma camada de cookies criada por nós.

**Diagrama simplificado**

```
[PWA Next.js/TS/Tailwind]
   ├─ Client Components ──(cliente browser @supabase/ssr)──┐
   └─ Server Components/Actions ──(cliente server @supabase/ssr)──┤
                                                                    ↓
                                                     [Supabase Auth (cookies de sessão)]
                                                     [PostgreSQL + Row Level Security]
                                                     [Storage] (futuro)
```

## 5. Banco de dados

Todas as tabelas usam `id UUID` como chave primária (`gen_random_uuid()`). **Somente as tabelas de domínio "pai"** (diretamente pertencentes a uma empresa) carregam `company_id`: `ingredients`, `ingredient_categories`, `products`, `inventory_counts`. Tabelas filhas (`product_ingredients`, `inventory_count_items`) **não** armazenam `company_id` — isso seria desnormalização apenas para facilitar RLS. A autorização delas é resolvida através da entidade pai (ver seção 9).

### 5.1 Tabelas

| Tabela | Campos principais | Relacionamentos |
|---|---|---|
| `profiles` | id (= auth.users.id), name, email, phone, terms_accepted_at, marketing_opt_in, created_at, updated_at | 1:N com `company_users` |
| `companies` | id, cnpj (normalizado, só dígitos), legal_name, trade_name, segment, employee_range, city, state, created_at, updated_at | 1:N com `company_users`, `ingredients`, `products`, `inventory_counts` |
| `company_users` | id, company_id, user_id, role, is_owner, created_at | liga `profiles` ↔ `companies` (N:N); `UNIQUE(company_id, user_id)` |
| `ingredient_categories` | id, company_id, name, created_at | 1:N com `ingredients` |
| `ingredients` | id, company_id, category_id, name, purchase_unit, usage_unit, **package_quantity**, **package_content**, package_price, unit_cost (calculado), is_active, created_at, updated_at | referenciado por `product_ingredients` e `inventory_count_items` |
| `products` | id, company_id, name, category, sale_price, is_active, created_at, updated_at, **prep_time_minutes**, **version**, **created_by** | 1:N com `product_ingredients` |
| `product_ingredients` | id, product_id, ingredient_id, quantity, unit, created_at | liga `products` ↔ `ingredients`; sem `company_id` — empresa resolvida via `products.company_id`; custo é sempre calculado via join com `ingredients.unit_cost` no momento da leitura, nunca gravado fixo aqui |
| `inventory_counts` | id, company_id, user_id, started_at, finished_at, total_inventory_value, created_at | 1:N com `inventory_count_items` |
| `inventory_count_items` | id, inventory_count_id, ingredient_id, closed_quantity, fraction_quantity, total_quantity, **unit_cost_at_count**, total_value, created_at | sem `company_id` — empresa resolvida via `inventory_counts.company_id`; snapshot histórico do custo no momento da contagem |
| `units_conversion` (apoio) | unit_from, unit_to, factor | **apenas conversões matematicamente universais** (kg↔g, L↔ml) — nunca embalagem→unidade de uso (ver Ajuste 2) |
| `analytics_events` | id, company_id, user_id, event_name, metadata (jsonb), created_at | suporta funil de ativação (signup_completed, first_ingredient_created, inventory_completed, etc.) |
| `admin_users` | id, **user_id** (→ auth.users.id), role, created_at, updated_at | acesso ao painel interno; `UNIQUE(user_id)`; **não** relacionado a `company_users` nem baseado em e-mail (ver Ajuste 6) |

### 5.2 Modelo de embalagem e custo unitário (Ajuste 2)

Conversões como "garrafa → ml" ou "caixa → unidade" não são universais — dependem do próprio insumo (uma garrafa de Gin tem 750 ml, uma de Vodka pode ter 1000 ml; uma caixa de cerveja tem 24 unidades, uma de refrigerante pode ter 12). Por isso esses dados pertencem ao insumo, não a uma tabela genérica de conversão:

- `purchase_unit`: unidade em que o insumo é comprado (ex.: garrafa, caixa, pacote).
- `usage_unit`: unidade em que o insumo é usado nas fichas técnicas e contagens (ex.: ml, unidade, g).
- `package_quantity`: quantas embalagens de compra o preço se refere (ex.: `1` garrafa, `24` = quando a "embalagem" já é a caixa fechada).
- `package_content`: quanto de `usage_unit` existe dentro de **uma** unidade de `purchase_unit` (ex.: `750` ml por garrafa; `1` unidade por lata dentro da caixa).
- `package_price`: preço pago pelo total de `package_quantity` embalagens.
- `unit_cost` (calculado): `package_price / (package_quantity × package_content)`.

Exemplos:

```
Gin Tanqueray
purchase_unit = garrafa | usage_unit = ml
package_quantity = 1 | package_content = 750 | package_price = 109,90
unit_cost = 109,90 / (1 × 750) = R$ 0,1465/ml

Heineken (caixa)
purchase_unit = caixa | usage_unit = unidade
package_quantity = 24 | package_content = 1 | package_price = 112,80
unit_cost = 112,80 / (24 × 1) = R$ 4,70/unidade
```

A tabela `units_conversion` continua existindo, mas só para conversões matematicamente universais e independentes de produto (`1 kg = 1000 g`, `1 L = 1000 ml`), usada apenas quando `usage_unit` de um insumo específico precisa ser convertida para outra unidade de massa/volume — nunca para inferir quantidade de embalagem.

*(A nomenclatura exata dos campos — `package_content` etc. — pode ser refinada na implementação, desde que o conceito de "dados de embalagem pertencem ao insumo" seja preservado.)*

### 5.3 Constraints e integridade (Ajuste 5)

- **CNPJ:** armazenado normalizado (somente dígitos, ex. `12345678000190`); a máscara (`12.345.678/0001-90`) é responsabilidade só da interface. `UNIQUE(cnpj)` em `companies`. Como o fluxo de "pedir acesso a uma empresa já existente com o mesmo CNPJ" ainda não está desenhado, essa constraint apenas impede duplicar a empresa — o tratamento de UX para esse caso fica registrado como risco em aberto (seção 10).
- **`company_users`:** `UNIQUE(company_id, user_id)` — impede vincular o mesmo usuário duas vezes à mesma empresa.
- **Valores monetários:** `package_price >= 0`, `sale_price >= 0`; tipo `numeric` (precisão decimal) em todo campo de dinheiro e de custo — nunca `float`.
- **Quantidades:** `package_quantity > 0`, `package_content > 0`, `quantity >= 0` (em `product_ingredients`), `closed_quantity >= 0`, `total_quantity >= 0` (em `inventory_count_items`).
- **Fração da garrafa aberta:** `fraction_quantity >= 0 AND fraction_quantity <= 1` (valores válidos: `0`, `0.25`, `0.50`, `0.75`, `1`).
- **Exclusão lógica (soft delete):** `ingredients` e `products` ganham `is_active boolean default true`. Como ambos são referenciados por fichas técnicas e por contagens históricas, a exclusão física quebraria o histórico — "arquivar" (`is_active = false`) é a operação padrão; exclusão física fica reservada a casos sem nenhum vínculo histórico.

**Foreign keys e estratégia de `ON DELETE`** (documentadas para a migration da próxima etapa; `CASCADE` não é usado de forma indiscriminada):

| FK | Estratégia | Motivo |
|---|---|---|
| `profiles.id → auth.users.id` | CASCADE | Perfil não existe sem o usuário de Auth |
| `company_users.company_id → companies.id` | CASCADE | Remover a empresa remove seus vínculos de usuário |
| `company_users.user_id → profiles.id` | CASCADE | Remover o usuário remove seus vínculos de empresa |
| `ingredients.company_id → companies.id` | CASCADE | Insumo não existe fora de uma empresa |
| `ingredients.category_id → ingredient_categories.id` | RESTRICT (ou `SET NULL` se a categoria for opcional) | Evita apagar categoria em uso sem decisão explícita |
| `products.company_id → companies.id` | CASCADE | Produto não existe fora de uma empresa |
| `product_ingredients.product_id → products.id` | CASCADE | Item de ficha técnica não existe sem o produto |
| `product_ingredients.ingredient_id → ingredients.id` | RESTRICT | Impede apagar fisicamente um insumo usado em ficha técnica — usar `is_active = false` em vez de excluir |
| `inventory_counts.company_id → companies.id` | CASCADE | Contagem não existe fora de uma empresa |
| `inventory_count_items.inventory_count_id → inventory_counts.id` | CASCADE | Item de contagem não existe sem a contagem |
| `inventory_count_items.ingredient_id → ingredients.id` | RESTRICT | Preserva o histórico de contagens; excluir fisicamente um insumo com contagens associadas não é permitido — de novo, usar `is_active = false` |
| `admin_users.user_id → auth.users.id` | CASCADE | Registro de admin não existe sem o usuário de Auth |

**Ponto crítico (regra do produto):** o custo de uma ficha técnica é sempre recalculado a partir de `ingredients.unit_cost` — se o preço do insumo mudar, todas as fichas técnicas que o usam refletem o novo valor automaticamente (join/view, nunca cópia). Já em `inventory_count_items`, o campo `unit_cost_at_count` é gravado no momento da contagem e nunca recalculado depois — contagens antigas preservam o valor histórico.

**Campos de evolução futura em `products` (Revisão 3, 2026-08-28):** a pedido do usuário, três colunas foram adicionadas em `products` mesmo sem uso na interface ainda, para não exigir uma migration retroativa quando essas funcionalidades forem construídas:

- `prep_time_minutes` (integer, opcional): tempo estimado de preparo, em minutos. Reservado para um cálculo futuro de produção/capacidade da cozinha ou do bar.
- `version` (integer, not null, default 1): incrementado automaticamente a cada `UPDATE` via trigger (`trg_products_bump_version` → `bump_version()`). Base para uma futura tela de histórico de alterações da ficha técnica.
- `created_by` (uuid, referencia `auth.users.id`, default `auth.uid()`): registra quem criou o produto, seguindo o mesmo padrão já usado em `inventory_counts.user_id`.
- "Arquivar sem apagar" **já existe** — é o `is_active` que `products` e `ingredients` já tinham desde a Revisão 2 (seção 5.3). Nenhuma coluna nova foi necessária para isso.

**Decisão deliberada — `custo_total` NÃO foi adicionado como coluna.** Foi sugerido guardar um `custo_total` na ficha técnica como base para CMV. Isso contraria diretamente o "Ponto crítico" acima: se `custo_total` fosse uma coluna gravada em `products`, ela ficaria desatualizada assim que o preço de qualquer insumo da receita mudasse, a menos que algo a recalculasse e reescrevesse toda vez — reintroduzindo exatamente a cópia de valor que a Revisão 2 eliminou de propósito. O caminho já existe no schema para quando o CMV histórico for realmente construído (Fase futura): seguir o mesmo padrão de `inventory_count_items.unit_cost_at_count` — um snapshot gravado em uma tabela de evento (ex.: uma venda, ou um "fechamento" de período), nunca um campo "atual" em `products` que precisaria ser mantido em sincronia manualmente.

Índices recomendados: `company_id` nas tabelas pai (`ingredients`, `ingredient_categories`, `products`, `inventory_counts`), `(company_id, name)` em `ingredients` e `products` para busca instantânea, `product_id` em `product_ingredients`, `inventory_count_id` em `inventory_count_items`.

## 6. Estrutura de pastas

A pasta `projeto-bar-control` já contém um protótipo Android nativo separado (gerado via Google AI Studio) em `app/`. Conforme decidido, o novo app Next.js/Supabase fica isolado em uma subpasta própria, sem misturar com o projeto Android/Gradle:

```
projeto-bar-control/
├── app/                        (projeto Android existente — não mexer)
├── web/                        (novo app Next.js — PWA)
│   ├── src/
│   │   ├── app/                 # rotas (App Router)
│   │   ├── components/          # componentes de UI reutilizáveis e genéricos
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── companies/
│   │   │   ├── ingredients/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   └── admin/
│   │   ├── lib/                 # clientes Supabase (browser/server via @supabase/ssr), helpers gerais
│   │   ├── services/            # chamadas de dados por domínio
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/                # formatação BRL, datas, CNPJ, telefone
│   │   ├── validators/           # schemas Zod
│   │   ├── providers/            # QueryClientProvider, AuthProvider
│   │   └── config/
│   ├── public/                  # manifest.json, ícones PWA
│   ├── supabase/
│   │   └── migrations/          # SQL versionado (tabelas, RLS, views) — a criar na Fase 2
│   └── docs/                    # este e outros documentos de planejamento
└── README.md
```

## 7. Telas

- Login / Criar conta
- Onboarding — Etapa 2: Empresa
- Onboarding — Etapa 3: Segmento
- Onboarding — Etapa 4: Tamanho do negócio
- Onboarding — Etapa 5: Função do usuário
- Termos de Uso (placeholder)
- Política de Privacidade (placeholder)
- Dashboard (início) — exibe a **Última Contagem**, não um "estoque em tempo real"
- Lista de Insumos (com busca)
- Cadastro/edição de insumo
- Lista de Produtos (com busca)
- Cadastro/edição de produto (ficha técnica)
- Detalhe da ficha técnica (custo, % e margem)
- Estoque — Última contagem (lista por insumo, com data/hora da fotografia mais recente)
- Nova contagem (item a item, com fracionamento)
- Resumo da contagem finalizada
- Histórico de contagens
- Comparação entre duas contagens
- Perfil (dados do usuário/empresa, sair)
- Painel administrativo interno (estrutura separada, fora do app do cliente)

## 8. Fluxos críticos

**Cadastro (onboarding completo)**
1. Usuário preenche nome, e-mail, telefone, senha → Supabase Auth cria o usuário → grava `profiles`.
2. Informa CNPJ, já normalizado para dígitos (consulta automática fica como TODO para versão futura) e preenche/edita razão social, nome fantasia, cidade, estado → cria `companies` (`UNIQUE(cnpj)`) e vincula em `company_users` com `is_owner = true`.
3. Seleciona segmento, tamanho do negócio e função → atualiza `companies`/`company_users`.
4. Aceita Termos de Uso (obrigatório) e decide sobre marketing (opcional, desmarcado por padrão) → grava `terms_accepted_at` e `marketing_opt_in` em `profiles`.
5. Evento `signup_completed` e `company_created` disparados para analytics.

**Cadastro de insumo**
1. Usuário informa nome, categoria, unidade de compra, unidade de uso, dados de embalagem (`package_quantity`, `package_content`) e preço pago (`package_price`).
2. Sistema calcula `unit_cost = package_price / (package_quantity × package_content)` automaticamente (ex.: R$ 109,90 ÷ 750 ml = R$ 0,1465/ml), usando `units_conversion` apenas se `usage_unit` precisar de conversão universal (kg↔g, L↔ml).
3. Grava `ingredients` com `company_id` resolvido no servidor a partir da sessão do usuário logado (nunca vindo do formulário do cliente).
4. Evento `ingredient_created` (e `first_ingredient_created` se for o primeiro).

**Criação de ficha técnica**
1. Usuário cria o produto (nome, categoria, preço de venda).
2. Adiciona ingredientes buscando por nome, informando a quantidade usada (com a unidade do próprio insumo).
3. Tela exibe, para cada ingrediente, o custo proporcional calculado em tempo real via `ingredients.unit_cost × quantidade`.
4. Sistema soma o custo total, calcula custo percentual `(custo total / preço de venda) × 100` e margem bruta `preço de venda − custo total`.
5. Como o custo nunca é copiado para dentro da ficha, qualquer alteração futura de preço do insumo atualiza o produto automaticamente.

**Contagem de estoque**
1. Usuário toca em "Nova contagem" → sistema lista todos os insumos ativos (`is_active = true`), um por vez, com contador `[-] quantidade [+]`.
2. Para insumos fracionáveis, usuário informa garrafas fechadas + fração da garrafa aberta (0/0.25/0.50/0.75/1), sistema soma e converte para a unidade de uso usando os dados de embalagem do próprio insumo (`package_content`).
3. Usuário navega com "Anterior"/"Próximo" até concluir todos os itens.
4. Ao finalizar, sistema grava um `inventory_counts` com `finished_at`, e um `inventory_count_items` por insumo, congelando `unit_cost_at_count` e calculando `total_value` da contagem.
5. Tela de resumo mostra data, responsável, itens contados e valor total aproximado do estoque — sempre rotulado como "Última contagem", nunca como "estoque atual" em tempo real.
6. Eventos `inventory_started` / `inventory_completed` (e `second_inventory_completed` na segunda contagem da empresa).

## 9. Segurança

- **Autenticação:** exclusivamente Supabase Auth via `@supabase/ssr` (clientes de browser e de servidor, sessão em cookies). Sem autenticação própria, sem tokens gerenciados manualmente, sem senha em tabela própria, sem token em `localStorage`. Estrutura de login preparada para adicionar "Entrar com Google" sem refatoração (mesmo fluxo de sessão).

- **Multi-tenancy e RLS — tabelas pai:** `ingredients`, `ingredient_categories`, `products` e `inventory_counts` têm `company_id` direto. RLS habilitado, com policies que verificam se `auth.uid()` pertence a um `company_users` daquela empresa através de uma função auxiliar (ex. `is_member_of_company(company_id)`), cobrindo `SELECT`, `INSERT`, `UPDATE` e `DELETE`.

- **Multi-tenancy e RLS — tabelas filhas (Ajuste 1):** `product_ingredients` e `inventory_count_items` **não** têm `company_id` próprio — normalização preservada. A autorização é resolvida subindo até a entidade pai:

  ```
  product_ingredients → products.company_id → company_users → auth.uid()
  inventory_count_items → inventory_counts.company_id → company_users → auth.uid()
  ```

  Ou seja, a policy de `product_ingredients` verifica se existe um `products` com aquele `id` cuja `company_id` pertence a uma empresa da qual o usuário é membro (via `EXISTS (SELECT 1 FROM products WHERE products.id = product_ingredients.product_id AND is_member_of_company(products.company_id))`, ou equivalente); o mesmo padrão vale para `inventory_count_items` via `inventory_counts`. Essa proteção deve existir para `SELECT`, `INSERT`, `UPDATE` e `DELETE` nas duas tabelas.

- **Princípio inegociável:** um filtro como `.eq("company_id", companyId)` no front-end **nunca** é considerado proteção suficiente — é só uma otimização de UX. A proteção real está nas policies de RLS do PostgreSQL, que continuam valendo mesmo que o usuário manipule o navegador, altere parâmetros, troque IDs manualmente ou chame a API diretamente.

- **Nunca confiar no client:** `company_id` de qualquer escrita é sempre resolvido no servidor (Server Action) a partir da sessão do usuário, nunca aceito como campo vindo do formulário.

- **Validação em duas camadas:** Zod no client (feedback imediato) e novamente no server antes de qualquer escrita no Supabase.

- **Chaves do Supabase (Ajuste 4):**
  - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — usadas no navegador; seguras porque toda a proteção real está no RLS.
  - `SUPABASE_SECRET_KEY` — usada **apenas no backend**, só se alguma funcionalidade administrativa futura realmente precisar de privilégio elevado; nunca deve contornar RLS para resolver problemas de policy mal escrita (o caminho correto é corrigir a policy).
  - Nunca criar uma variável como `NEXT_PUBLIC_SUPABASE_SECRET_KEY`: a secret key nunca pode chegar ao navegador, aparecer em código client-side, ser commitada no Git, aparecer em log, ou constar com valor real em `.env.example`.

- **Painel admin (Ajuste 6):** tabela `admin_users` vinculada por `user_id → auth.users.id` (`UNIQUE(user_id)`), nunca por e-mail. Ocultar a rota `/admin` na interface não é segurança — a autorização precisa existir também no servidor (toda Server Action/Route Handler administrativa reconfirma o vínculo em `admin_users`), no banco (RLS das tabelas que o admin acessa) e nas próprias policies, nunca dependendo de checagens como `user.email === "admin@email.com"`.

- **Sessões:** gerenciadas pelo Supabase Auth com cookies via `@supabase/ssr`, seguindo o comportamento recomendado oficialmente pela biblioteca (sem afirmar antecipadamente flags específicas como `HttpOnly`); chaves privadas (`SUPABASE_SECRET_KEY`) nunca expostas ao navegador.

- **Variáveis de ambiente:** todas as chaves do Supabase em `.env`, nunca versionadas.

## 10. Plano de implementação

```
FASE 1 — Arquitetura e Planejamento ✓ (revisada)
   ↓
FASE 2 — Fundação
   M0.1 Projeto Next.js  → M0.2 Supabase  → M0.3 Banco  → M0.4 RLS  → M0.5 Testes de isolamento  → M0.6 PWA  → M0.7 Build/validação
   ↓
FASE 3 — Autenticação + Onboarding
   ↓
FASE 4 — Dashboard
   ↓
FASE 5 — Insumos
   ↓
FASE 6 — Ficha Técnica
   ↓
FASE 7 — Contagem
   ↓
FASE 8 — Histórico
   ↓
FASE 9 — Busca e polimento (responsividade, acessibilidade)
   ↓
FASE 10 — Base do admin e analytics
```

### FASE 2 — Fundação (detalhada, Ajuste 8)

- **M0.1 — Projeto Web:** criar `web/` com Next.js, TypeScript, Tailwind, ESLint e a estrutura inicial de pastas (seção 6). Nenhuma funcionalidade implementada ainda.
- **M0.2 — Supabase:** instalar `@supabase/supabase-js` e `@supabase/ssr`; criar os clientes de browser e de servidor; configurar as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`).
- **M0.3 — Banco de dados:** só depois da arquitetura estar fechada (este documento), criar as migrations com tabelas, constraints, foreign keys e índices descritos na seção 5.
- **M0.4 — Row Level Security:** criar as policies para todas as tabelas (pai e filhas), incluindo a função auxiliar `is_member_of_company(company_id)` e o padrão de autorização via entidade pai para `product_ingredients`/`inventory_count_items`.
- **M0.5 — Testes de isolamento (obrigatória):** criar em ambiente de desenvolvimento um Usuário A/Empresa A e um Usuário B/Empresa B com registros distintos, e confirmar explicitamente:
  - Usuário A consegue `SELECT`/`INSERT`/`UPDATE`/`DELETE` (quando permitido) apenas em dados da Empresa A;
  - Usuário A **não** consegue `SELECT`/`INSERT`/`UPDATE`/`DELETE` em dados da Empresa B, mesmo trocando IDs manualmente nas requisições;
  - o mesmo teste é repetido a partir do Usuário B;
  - o teste cobre explicitamente acesso cruzado em `ingredients`, `products`, `product_ingredients`, `inventory_counts` e `inventory_count_items`.
  - **Critério para continuar:** se qualquer usuário conseguir acessar dado de outra empresa, a Fase 2 não avança — a policy é corrigida e os testes são executados novamente até o isolamento ser confirmado.
- **M0.6 — PWA:** só depois da base de segurança validada — manifest, metadados, ícones, instalação e service worker (se necessário), evitando cache de informação sensível.
- **M0.7 — Validação da Fundação:** rodar `npm run lint`, `npm run typecheck`, `npm run build` e `npm test` (se houver testes configurados). Resultados só são reportados como aprovados depois de efetivamente executados — nunca por suposição.

### Demais fases (mantidas do planejamento original, renumeradas)

- **FASE 3 — Autenticação e onboarding:** criar conta, cadastro de empresa (sem consulta de CNPJ ainda), segmento, tamanho, função, termos e opt-in.
- **FASE 4 — Dashboard:** shell do app, bottom navigation, estados vazios, card de "Última Contagem".
- **FASE 5 — Insumos:** CRUD completo, categorias, cálculo de custo unitário com o modelo de embalagem revisado (seção 5.2).
- **FASE 6 — Ficha técnica:** CRUD de produtos, montagem de ficha técnica, cálculo de custo/percentual/margem, atualização em cascata.
- **FASE 7 — Contagem:** visualização da última contagem, fluxo de nova contagem item a item com fracionamento, resumo de finalização.
- **FASE 8 — Histórico:** lista de contagens salvas, comparação entre duas contagens.
- **FASE 9 — Busca e polimento:** busca instantânea em insumos/produtos, revisão de responsividade (375/390/430/768/1024px) e acessibilidade.
- **FASE 10 — Base do admin e analytics:** painel interno mínimo (contadores gerais) e disparo dos eventos de funil, com autorização via `admin_users.user_id`.

### Riscos e decisões em aberto

- A pasta do projeto já contém um app Android nativo (Google AI Studio) do mesmo domínio; mantido separado do novo app Next.js (`app/` vs `web/`).
- Consulta automática de CNPJ depende de uma API pública/paga a ser escolhida depois — campo pronto na UI, preenchimento manual por ora (TODO).
- `UNIQUE(cnpj)` impede duplicar empresa, mas o fluxo de UX para "um segundo usuário tenta cadastrar uma empresa com CNPJ já existente" (ex.: solicitar acesso ao proprietário) ainda não está desenhado — fica como decisão em aberto para não bloquear a Fase 2.
- Login com Google fica preparado na arquitetura de Auth, mas não implementado nesta primeira fase.
- Nomenclatura exata dos campos de embalagem (`package_quantity`/`package_content`) pode ser refinada durante a migration, mantendo o conceito da seção 5.2.
- **Posicionamento de produto (Revisão 3):** sugestão recebida de vender o app não como "gerador de ficha técnica", e sim como **"o caderno digital de receitas do seu estabelecimento"** — linguagem mais familiar para o público-alvo (donos de bar/restaurante 35–65 anos, pouca familiaridade com tecnologia). Não é uma mudança de banco ou de código; é uma decisão de copy para aplicar em telas de onboarding, landing page e materiais de divulgação quando essas telas forem escritas (Fase 3 em diante). Registrado aqui para não se perder até lá.

---

## Changelog desta revisão

| Seção | Status | O que mudou |
|---|---|---|
| 2 — Escopo do MVP | ALTERADA | Adicionada nota conceitual: estoque = última contagem, não tempo real |
| 3 — Jornada do usuário | ALTERADA | Dashboard rotulado como "Última Contagem" |
| 4 — Arquitetura | ALTERADA | Autenticação detalhada com `@supabase/ssr` (clientes browser/server, cookies sem flags fixas) |
| 5 — Banco de dados | ALTERADA | Modelo de embalagem movido para `ingredients` (Ajuste 2); tabelas filhas sem `company_id` explicitado (Ajuste 1); constraints, `is_active` e estratégia de `ON DELETE` documentadas (Ajuste 5); `admin_users` por `user_id` (Ajuste 6) |
| 6 — Estrutura de pastas | Sem alteração de conteúdo | Apenas referência atualizada aos clientes Supabase via `@supabase/ssr` |
| 7 — Telas | ALTERADA | "Estoque atual" renomeado para "Última contagem" |
| 8 — Fluxos críticos | ALTERADA | Fluxo de cadastro de insumo usa o novo modelo de embalagem; fluxo de contagem reforça o rótulo "Última contagem" |
| 9 — Segurança | ALTERADA | RLS de tabelas filhas via entidade pai (Ajuste 1); princípio de nunca confiar em filtro client-side; nomenclatura de chaves Supabase (Ajuste 4); admin por identidade autenticada (Ajuste 6); autenticação via `@supabase/ssr` |
| 10 — Plano de implementação | ALTERADA | Fundação dividida em M0.1–M0.7 com testes de isolamento obrigatórios (M0.5); fases renumeradas (FASE 2 a FASE 10) |

### Revisão 3 (2026-08-28)

| Seção | Status | O que mudou |
|---|---|---|
| 5.1 — Tabelas | ALTERADA | `products` ganhou `prep_time_minutes`, `version`, `created_by` (aplicado via migration `products_prep_time_version_created_by` no projeto Supabase real) |
| 5 (nota pós-5.3) | NOVA | Explica os 3 campos novos, confirma que `is_active` já cobria "arquivar sem apagar", e registra a decisão de **não** adicionar `custo_total` como coluna (conflitaria com o "Ponto crítico" de nunca copiar custo) |
| 10 — Riscos e decisões em aberto | ALTERADA | Registrada sugestão de posicionamento ("caderno digital de receitas") para aplicar em copy futura |

## Revisão final de segurança

- **Autenticação:** Supabase Auth via `@supabase/ssr`, sem autenticação própria — OK.
- **Multi-tenancy:** isolamento entre empresas garantido por `company_id` nas tabelas pai + RLS; verificação formal fica a cargo dos testes obrigatórios de M0.5 — desenho OK, validação pendente da implementação.
- **RLS de tabelas filhas:** `product_ingredients` e `inventory_count_items` protegidas via entidade pai, sem `company_id` redundante — OK.
- **Chaves:** publishable key no cliente, secret key só no servidor, nunca `NEXT_PUBLIC_SUPABASE_SECRET_KEY` — OK.
- **Banco:** foreign keys com estratégia de `ON DELETE` justificada, `UNIQUE` em `cnpj` e `(company_id, user_id)`, `CHECK` em quantidades/frações/valores monetários, índices nas colunas de filtro/busca — OK.
- **Dinheiro:** `numeric` em todos os campos monetários e de custo, nunca `float` — OK.
- **Admin:** autorização via `admin_users.user_id → auth.users.id`, reforçada em servidor/banco/policies, nunca só por e-mail ou por ocultar a rota — OK.
- **Histórico:** `unit_cost_at_count` preservado como snapshot, nunca recalculado retroativamente — OK.

### Notas (0–10)

| Dimensão | Nota | Observação |
|---|---|---|
| Escopo | 9 | MVP continua enxuto; único ponto em aberto é o fluxo de CNPJ duplicado, que não bloqueia a Fase 2 |
| Arquitetura | 9 | Autenticação e camadas bem definidas; falta apenas a implementação real para validar na prática |
| Banco de dados | 9 | Modelo de embalagem corrigido, tabelas filhas normalizadas, constraints e FKs documentadas |
| Segurança | 8 | Desenho consistente e sem chaves privilegiadas expostas; nota não é 10 porque o isolamento real só é comprovado depois dos testes obrigatórios de M0.5 |
| Manutenibilidade | 9 | Separação por domínio, soft delete evitando perda de histórico, nomenclatura de chaves alinhada às boas práticas atuais do Supabase |

### Bloqueadores para iniciar a Fase 2

Nenhum problema bloqueador identificado. O documento está consistente entre si (escopo, banco, segurança e plano de implementação concordam), e os pontos que dependem de decisões futuras (fluxo de CNPJ duplicado, consulta pública de CNPJ, login Google) estão explicitamente registrados como risco em aberto, não como inconsistência.

---

**FASE 1 REVISADA E CONCLUÍDA — PRONTA PARA FASE 2: FUNDAÇÃO**

Primeira implementação recomendada: **M0.1 — Projeto Web**, ou seja, criar a subpasta `web/` com Next.js + TypeScript + Tailwind + ESLint e a estrutura inicial de pastas, sem nenhuma funcionalidade ainda. Os passos seguintes (M0.2 a M0.7) seguem em sequência, com o M0.5 (testes de isolamento) como etapa obrigatória antes de qualquer tela ser construída.
