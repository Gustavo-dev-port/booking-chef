<div align="center">

# 🍽️ Booking Chef

**Ficha técnica organizada, booking em PDF e controle de estoque com custo real — para bares e restaurantes.**

</div>

---

## O que é

Bares, restaurantes e lanchonetes pequenos costumam guardar suas receitas (fichas técnicas) em caderno, planilha solta ou na cabeça de quem cozinha. Isso torna difícil treinar equipe nova, manter padrão de preparo e saber quanto cada prato/drink realmente custa.

O **Booking Chef** é um app mobile (React Native + Expo) que resolve isso: cadastro de fichas técnicas de **Bar** e **Cozinha**, geração de um **booking em PDF** pronto para treinamento/apresentação, e — em desenvolvimento agora — **estoque conectado à ficha técnica** com **CMV automático** e sugestão de preço de venda.

Não é um ERP: sem PDV, emissão fiscal, delivery ou financeiro completo. O foco é resolver bem dois problemas — organizar a receita e saber o custo dela.

## Status do projeto

| Versão | Escopo | Status |
|---|---|---|
| **V1 — Fundação** | Login, Empresa, Fichas técnicas (Bar + Cozinha, ingrediente livre), Booking em PDF | ✅ Entregue e em produção |
| **V2 — Gestão Inteligente** | Estoque (contagem, movimentações), CMV automático, preço sugerido, equipe com permissões | 🚧 Em desenvolvimento (branch atual: `v2-estoque-compra-uso`) |
| **V3 — Escala e Inteligência** | Produção, offline-first, dashboard/BI, IA para precificação | 🔜 Planejada |

Detalhes, estimativas e dependências de cada versão em [`mobile/docs/10_ROADMAP.md`](./mobile/docs/10_ROADMAP.md).

## Estrutura do repositório

Este repositório guarda o histórico completo do projeto, incluindo caminhos que já foram abandonados. Só uma pasta está em desenvolvimento ativo:

| Pasta | O que é | Status |
|---|---|---|
| [`mobile/`](./mobile) | **App ativo.** React Native + Expo, é aqui que todo o desenvolvimento acontece hoje. | ✅ Ativo |
| [`web/`](./web) | Protótipo Next.js do mesmo domínio (estoque + cardápio digital público). Pausado desde o pivô para mobile (28/08/2026); mantido só como referência de arquitetura. | ⏸️ Pausado |
| [`app/`](./app) | Protótipo Android nativo (Kotlin), gerado no Google AI Studio com a API Gemini — a ideia original que deu origem ao projeto. Sem desenvolvimento novo, isolado do resto do repo. | 🗄️ Arquivado |

Se você chegou aqui procurando código, é em `mobile/` que ele está.

## Stack (`mobile/`)

- **App:** React Native 0.86 + Expo 57 (New Architecture), Expo Router, NativeWind (Tailwind para RN)
- **Estado e formulários:** Zustand, React Hook Form + Zod
- **Backend:** Supabase (Postgres + Auth via `@supabase/ssr`/`expo-secure-store` + Storage + RLS), mesmo projeto (`barcontrol-dev`) usado pelo protótipo web pausado
- **PDF:** `expo-print`
- **Testes:** Jest + Testing Library, `tsc --noEmit`, `expo-doctor`

## Rodando localmente

```bash
cd mobile
npm install
cp .env.example .env   # preencher EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS), ou rode `npm run android` / `npm run ios` com um emulador.

Para rodar os testes: `npm test` (dentro de `mobile/`).

## Documentação

Toda a documentação do produto vive em [`mobile/docs/`](./mobile/docs) — comece pelo [`README.md`](./mobile/docs/README.md) de lá, que é o índice de leitura. Dois pacotes coexistem, com propósitos diferentes:

- [`DOCUMENTACAO-BOOKING-CHEF.md`](./mobile/docs/DOCUMENTACAO-BOOKING-CHEF.md) — referência técnica única, escrita a partir do código e do schema reais: como o app funciona hoje, campo a campo.
- `01_PRD.md` a `12_CRITERIOS_ACEITE.md` — pacote de planejamento de produto (visão, personas, jornadas, UX, arquitetura, banco, API, segurança/LGPD, roadmap, backlog, critérios de aceite), distinguindo sempre ✅ implementado de 🔜 planejado.

## Licença

Ainda não definida a nível de projeto.
