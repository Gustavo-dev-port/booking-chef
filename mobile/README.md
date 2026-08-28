# mobile — Ficha Técnica (Booking Chef) v0.0.1

App mobile (React Native + Expo) para cadastro de fichas técnicas (Bar + Cozinha) e geração de booking em PDF. Reaproveita o mesmo backend Supabase do app web (`barcontrol-dev`). Ver `docs/FASE1-ARQUITETURA-MOBILE.md` para o plano completo.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencher EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (a mesma do web/.env.local)
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS) ou rode `npm run android` com um emulador.

## Estado atual (Fase 2 — Fundação)

- Projeto Expo + TypeScript + Expo Router + NativeWind configurados e validados (`npx tsc --noEmit`, `npx expo-doctor`, `npx expo export` — todos passando).
- Cliente Supabase (`src/lib/supabase.ts`) com sessão via `expo-secure-store`.
- Duas telas placeholder (Home e Login) só para validar navegação/estilo — **sem lógica ainda**.
- Migrations já aplicadas no Supabase real (ver `docs/FASE1-ARQUITETURA-MOBILE.md`, seção 3): campos de ficha técnica em `products`, ingrediente 100% texto livre em `product_ingredients`, bucket `product-photos`.

## Próximos passos (Fase 3+)

Autenticação real (Supabase Auth), CRUD de ficha técnica (Bar + Cozinha, ingrediente livre), upload de foto, geração de PDF do booking. Ver o plano em `docs/`.
