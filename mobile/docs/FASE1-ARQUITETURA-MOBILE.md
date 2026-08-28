# App Mobile — Ficha Técnica (v0.0.1) — FASE 1: Arquitetura e Planejamento

> Plano apresentado antes de qualquer código, conforme pedido no documento-base ("Booking Chef"). Nenhum projeto Expo, migration ou dependência foi criado ainda — só este documento e, quando indicado, mudanças de banco já aprovadas na conversa.
>
> **Revisão (2026-08-28):** a v0.0.1 fica ainda mais simples do que a primeira versão deste plano — sem busca nem catálogo de insumo, ingrediente 100% texto livre ("escrito à mão"). Ver seção 4.

---

## 1. O que decidimos (recapitulando o pivô)

- **V1 = só ficha técnica**, mobile, cobrindo **Bar e Cozinha juntos**. Estoque (contagem) e cardápio digital/garçom-ai **continuam existindo no banco e no app web, sem receber trabalho novo agora** — nada nesse plano toca ou desliga o que já está em produção.
- **Stack mobile = React Native + Expo**, reescrito do zero como projeto novo (o front-end Next.js não é reaproveitado). O **banco (Supabase) é reaproveitado** — é o mesmo projeto real (`barcontrol-dev`) que já serve o app web.
- **Geração de booking em PDF entra no v1** — é o diferencial competitivo do produto, não fica para depois.

## 2. Por que reaproveitar o banco em vez de criar o schema do documento Booking Chef do zero

O documento-base sugere tabelas simples: `establishments`, `users`, `recipes`, `ingredients` (esses últimos só com nome/quantidade/unidade, sem custo). O banco real já tem algo mais avançado, construído nas Fases 1–2 do app web:

| Booking Chef (documento) | Já existe no banco real | O que ganhamos reaproveitando |
|---|---|---|
| `establishments` | `companies` | CNPJ único, multi-tenant, RLS já testado (isolamento entre empresas validado com usuários reais) |
| `users` (senha própria) | `profiles` + Supabase Auth (`auth.users`) | Autenticação e hash de senha já são 100% do Supabase Auth — nunca senha em texto puro, nunca gerenciamento manual de token (exigência de LGPD do próprio documento, já resolvida) |
| `recipes` | `products` | — |
| `ingredients` (texto livre, sem custo) | `ingredients` (catálogo por empresa) + `product_ingredients` (liga produto ↔ insumo) | Cada ingrediente da ficha técnica já pode ter custo unitário calculado. **Isso é literalmente o que o próprio documento pede na seção final ("mantenha o projeto preparado para futuras funcionalidades como estoque, CMV e precificação")** — já está pronto, não precisa reconstruir depois. |

Conclusão: adaptamos o `products`/`product_ingredients`/`ingredients` que já existe, em vez de criar `recipes` do zero. Menos retrabalho e mantém o caminho para estoque/CMV aberto, como o próprio documento pede.

## 3. O que falta no banco (o que a Fase 6 nunca chegou a construir)

O `products` real hoje foi construído só para o cardápio digital (nome, categoria, preço, descrição, tags, destaque, ordem, slug) — **nenhum campo de receita existe ainda**: sem modo de preparo, sem foto, sem observações, sem rendimento/copo/decoração (bar) ou peso final (cozinha). Migration nova, só ADD COLUMN (não quebra o cardápio digital em produção):

```sql
alter table public.products
  add column type text check (type is null or type in ('bar', 'cozinha')),
  add column instructions text,        -- modo de preparo
  add column notes text,               -- observações (opcional)
  add column yield_amount text,        -- rendimento (ex.: "1 dose", "4 porções")
  add column glass_type text,          -- copo utilizado (só bar)
  add column garnish text,             -- decoração (só bar)
  add column final_weight text,        -- peso final (só cozinha)
  add column photo_path text;          -- caminho no Storage
```

- `type` fica **nullable** de propósito: os 93 produtos do cardápio digital hoje não têm bar/cozinha definido e não precisam ganhar isso retroativamente agora — só toda ficha técnica nova criada pelo app mobile vai preencher.
- Criar um bucket de **Storage** (`product-photos`, privado, acesso via RLS por `company_id` na mesma linha do `products`) — hoje não existe nenhum bucket no projeto.
- Nada em `ingredients`, `inventory_counts`, `analytics_events`, cardápio digital ou garçom-ai muda.

Além disso, `product_ingredients` precisa deixar de exigir um insumo já cadastrado (ver seção 4):

```sql
alter table public.product_ingredients
  alter column ingredient_id drop not null,
  add column ingredient_name text;

alter table public.product_ingredients
  add constraint product_ingredients_identity_check
  check (ingredient_id is not null or ingredient_name is not null);

comment on column public.product_ingredients.ingredient_name is
  'Nome do insumo digitado livremente pelo usuário (v0.0.1, sem catálogo). Preenchido quando ingredient_id é nulo. Uma fase futura de conciliação casa esse texto com o catálogo ingredients e preenche ingredient_id.';
```

## 4. Decisão de UX: ingrediente 100% texto livre na v0.0.1 (sem busca, sem catálogo)

**Revisado a pedido do usuário** — a primeira versão deste plano previa busca + "criar rapidinho" no catálogo `ingredients`. Isso saiu do v0.0.1: **nenhuma tela de insumo, nenhuma busca**. O usuário digita o nome do ingrediente livremente, como se estivesse escrevendo à mão — sem nenhuma verificação, sem nenhum vínculo obrigatório com o catálogo.

Como fica na prática:

- Cada linha de ingrediente na ficha técnica tem 3 campos de texto livre: **ingrediente** (nome digitado), **quantidade**, **unidade** — igual ao documento-base original, sem nenhuma etapa de busca/seleção no meio.
- No banco, isso grava direto em `product_ingredients.ingredient_name` (novo campo), com `ingredient_id` **nulo**. Não existe custo/CMV para essas linhas na v0.0.1 — e está tudo bem, essa versão não promete cálculo de custo.
- **Fase futura (fora do escopo da v0.0.1), já prevista no schema:** uma tela/rotina de conciliação que olha os `ingredient_name` digitados, verifica se já existe um insumo com nome parecido no catálogo `ingredients` da empresa e, se não existir, cadastra um insumo novo **só com o nome** (sem preço/embalagem) — depois preenchendo `ingredient_id` da linha. Isso é o que abre a porta pra custo/CMV mais adiante, sem que o usuário tenha precisado pensar em "cadastrar insumo" na v0.0.1. Não construir isso agora — só deixar registrado que o campo `ingredient_name` existe justamente para viabilizar essa conciliação depois.

## 5. Telas (wireframes em texto)

Reaproveitando a estrutura do documento-base, adaptada ao que muda de fato:

```
Onboarding (3 telas, igual ao documento) → Login/Criar conta
   ↓
Home
   🍸 Bar   |   👨‍🍳 Cozinha   |   📖 Gerar Booking
   Últimas fichas editadas
   ↓
Lista de fichas (Bar OU Cozinha — mesma tela, filtrada por `type`)
   Busca por nome · Filtro categoria · Ordenar A-Z / Mais recentes
   Estado vazio: "Você ainda não possui nenhuma ficha técnica" + botão "Criar primeira ficha"
   ↓
Editar ficha técnica
   Informações: nome, categoria, foto, rendimento, [copo+decoração se Bar] / [peso final se Cozinha]
   Ingredientes: lista dinâmica — texto livre (sem busca): ingrediente, quantidade, unidade
   Modo de preparo: texto longo (numerado, se Cozinha)
   Observações: opcional
   ↓
Gerar Booking (PDF)
   Escolhe: Booking do Bar / Booking da Cozinha / os dois
   Capa (logo, nome do estabelecimento, data, tipo) → Sumário → 1 ficha por página (foto, nome, categoria, ingredientes em tabela, preparo, observações) → rodapé (nome do estabelecimento + nº de página)
```

Login/Cadastro reaproveitam Supabase Auth direto (sem reescrever hash de senha, JWT, etc. — isso já é resolvido pela biblioteca, exatamente como o documento-base exige).

## 6. Stack e bibliotecas

Conforme o documento-base: **React Native + Expo + TypeScript + Expo Router + NativeWind + React Hook Form + Zod + Zustand**, mais:

- `@supabase/supabase-js` (mesmo projeto `barcontrol-dev`) — sessão via `expo-secure-store` (nunca `AsyncStorage` puro para token, por LGPD/segurança).
- `expo-image-picker` + upload pro bucket `product-photos`.
- `expo-print` para o PDF (gera HTML → PDF; mais simples de estilizar tabela/capa/rodapé do que `react-native-pdf`, que é melhor pra *visualizar* PDF do que gerar).

## 7. Estrutura de pastas (novo projeto)

A pasta do repositório já tem `app/` (protótipo Android antigo) e `web/` (Next.js). O app mobile novo entra em `mobile/`, isolado dos outros dois:

```
projeto-bar-control/
├── app/            (Android nativo antigo — não mexer)
├── web/            (Next.js/PWA — estoque + cardápio digital, pausado, não mexer)
├── mobile/         (NOVO — React Native + Expo)
│   ├── app/                    # rotas (Expo Router)
│   ├── src/
│   │   ├── components/         # componentes únicos: campo de texto, seletor de categoria, upload de imagem, ingrediente, botão principal, card de ficha
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── recipes/        # ficha técnica (bar + cozinha) — ingrediente é texto livre, sem tela própria
│   │   │   └── booking/        # geração de PDF
│   │   ├── lib/                # cliente Supabase (expo-secure-store)
│   │   ├── hooks/
│   │   ├── types/
│   │   └── validators/         # schemas Zod
│   └── docs/
└── README.md
```

## 8. Plano de fases

```
FASE 1 — Arquitetura (este documento) ✓
   ↓
FASE 2 — Fundação: projeto Expo + TS + Router + NativeWind; cliente Supabase (expo-secure-store); migration da seção 3 aplicada
   ↓
FASE 3 — Autenticação: Login / Criar conta / Esqueci senha, reaproveitando Supabase Auth e a tabela `companies`/`company_users` já existentes (mesmo fluxo de onboarding que o app web já tem desenhado)
   ↓
FASE 4 — Ficha técnica (Bar + Cozinha): Home, lista com busca/filtro/ordenação, CRUD completo (informações + ingredientes 100% texto livre + modo de preparo + observações), upload de foto
   ↓
FASE 5 — Booking em PDF: capa, sumário, uma ficha por página, rodapé, A4/preto-e-branco/quebra automática
   ↓
FASE 6 — Polimento UX (heurísticas de Nielsen, acessibilidade 44x44/AA, estados vazios) + LGPD (termos, política, exclusão de conta)
   ↓
FASE 7 — Testes + Build Android (.apk)
   ↓
(fora da v0.0.1) FASE 8 — Conciliação de insumos: rotina que casa `ingredient_name` digitado com o catálogo `ingredients`, cadastra o que faltar só com o nome, preenche `ingredient_id` — abre a porta pra custo/CMV sem exigir nada disso do usuário na v0.0.1
```

## 9. Riscos e decisões em aberto

- **Nome do app**: o documento-base chama de "Booking Chef" — confirmar se é esse o nome definitivo antes de configurar `app.json`/ícone/splash.
- **`type` no cardápio digital**: os produtos que já são exibidos no cardápio digital hoje ficam com `type = NULL`. Se algum dia quisermos que toda ficha técnica cadastrada no mobile apareça automaticamente no cardápio digital do web, precisamos desenhar essa ponte depois — não faz parte do v1.
- **Onboarding**: o app web já tem um fluxo de cadastro de empresa desenhado (CNPJ, segmento, tamanho, função). Preciso confirmar se o mobile reaproveita esse mesmo fluxo completo ou usa uma versão simplificada (o documento-base pede só nome/CNPJ/responsável/telefone/email/senha).
- **Ingrediente livre sem verificação**: como não há busca nem catálogo na v0.0.1, o mesmo insumo pode ser digitado de formas diferentes em fichas diferentes ("Limão", "limão siciliano", "Limao") — isso é aceito de propósito nessa versão; é exatamente o que a Fase 8 (conciliação, fora da v0.0.1) resolve mais adiante, não precisa ser tratado agora.

---

**Aguardando aprovação para começar a FASE 2** (criar o projeto Expo e aplicar a migration da seção 3 no banco real).
