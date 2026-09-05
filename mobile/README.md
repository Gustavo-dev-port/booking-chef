# mobile — Booking Chef

App mobile (React Native + Expo) para fichas técnicas (Bar + Cozinha), booking em PDF e — em desenvolvimento agora — estoque com CMV automático. Reaproveita o mesmo backend Supabase do protótipo web pausado (`barcontrol-dev`).

Documentação completa em [`docs/`](./docs) — comece por [`docs/README.md`](./docs/README.md).

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencher EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (a mesma do web/.env.local)
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS), ou rode `npm run android` / `npm run ios` com um emulador.

```bash
npm test          # Jest
npx tsc --noEmit  # typecheck
npx expo-doctor   # saúde do projeto Expo
```

## Estado atual

- **V1 — Fundação (✅ entregue):** autenticação real, cadastro de empresa (CNPJ), fichas técnicas de Bar e Cozinha com ingrediente 100% texto livre, upload de foto, geração de booking em PDF, exclusão de conta (LGPD).
- **V2 — Gestão Inteligente (🚧 em andamento, branch `v2-estoque-compra-uso`):** estoque conectado à ficha técnica (estende a tabela `ingredients` em vez de nascer paralela — decisão registrada em `docs/07_DATABASE.md`), movimentações de estoque via função `register_inventory_movement` (atômica, único caminho de escrita), unidade de compra separada da unidade de uso. CMV automático e preço sugerido ainda por vir nesta versão.
- **V3 — Escala e Inteligência (🔜 planejada):** produção, offline-first, dashboard/BI, IA para precificação. Ver `docs/10_ROADMAP.md`.

## Estrutura

- `app/` — rotas (Expo Router): `(auth)`, `(onboarding)`, `(app)` (fichas, booking, estoque, perfil)
- `src/features/` — lógica por domínio (auth, onboarding, recipes, booking, inventory, theme)
- `src/components/`, `src/validators/`, `src/lib/` — componentes compartilhados, validação (Zod) e cliente Supabase
- `docs/` — documentação técnica e de produto completa
