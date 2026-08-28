import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';

/**
 * Cliente Supabase do app mobile. A sessão nunca fica em AsyncStorage puro —
 * usa expo-secure-store (Keychain no iOS, Keystore no Android), por LGPD/segurança.
 * Mesmo projeto Supabase real (barcontrol-dev) que o app web usa.
 */

// expo-secure-store não garante um limite oficial, mas historicamente
// algumas versões de iOS rejeitam valores acima de ~2048 bytes (ver docs
// SDK v57 de expo-secure-store). A sessão completa do Supabase (access +
// refresh token + dados do usuário) pode passar disso — por isso o valor é
// fatiado em pedaços menores e remontado na leitura, em vez de gravado
// direto. Ficava marcado como TODO da Fase 2; resolvido na Fase 3, que é
// quando a sessão passa a ter dados reais de verdade.
const CHUNK_SIZE = 1800;
const chunkCountKey = (key: string) => `${key}_chunk_count`;
const chunkKey = (key: string, index: number) => `${key}_chunk_${index}`;

async function getChunkCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(chunkCountKey(key));
  return raw ? Number(raw) : 0;
}

async function deleteChunks(key: string, count: number): Promise<void> {
  await Promise.all(
    Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, i)))
  );
  await SecureStore.deleteItemAsync(chunkCountKey(key));
}

const secureStoreAdapter: SupportedStorage = {
  getItem: async (key) => {
    const count = await getChunkCount(key);
    if (count === 0) {
      return SecureStore.getItemAsync(key);
    }
    const parts = await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i)))
    );
    return parts.every((part) => part !== null) ? parts.join('') : null;
  },
  setItem: async (key, value) => {
    const previousCount = await getChunkCount(key);

    if (value.length <= CHUNK_SIZE) {
      if (previousCount > 0) await deleteChunks(key, previousCount);
      await SecureStore.setItemAsync(key, value);
      return;
    }

    await SecureStore.deleteItemAsync(key);
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(chunkKey(key, i), chunk)));
    if (previousCount > chunks.length) {
      await Promise.all(
        Array.from({ length: previousCount - chunks.length }, (_, i) =>
          SecureStore.deleteItemAsync(chunkKey(key, chunks.length + i))
        )
      );
    }
    await SecureStore.setItemAsync(chunkCountKey(key), String(chunks.length));
  },
  removeItem: async (key) => {
    const count = await getChunkCount(key);
    if (count > 0) await deleteChunks(key, count);
    await SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY precisam estar definidas (ver .env.example).'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
