import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { colorScheme as nativewindColorScheme } from 'nativewind';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-preference';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

type ThemeState = {
  preference: ThemePreference;
  loaded: boolean;
  setPreference: (value: ThemePreference) => void;
};

/**
 * Preferência de tema (Fase 8.2, pedido do usuário: "opção escuro e ser
 * fácil de fazer a troca"). O NativeWind já sabe aplicar `dark:` sozinho
 * a partir do tema do sistema, mas não guarda a escolha manual do usuário
 * entre uma abertura do app e outra — isso é feito aqui, com
 * expo-secure-store (mesmo mecanismo já usado pra sessão; aqui guarda só
 * uma preferência de UI, nada sensível).
 */
export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  loaded: false,
  setPreference: (value) => {
    nativewindColorScheme.set(value);
    SecureStore.setItemAsync(STORAGE_KEY, value).catch(() => {});
    set({ preference: value });
  },
}));

/** Chamar uma única vez, no layout raiz, antes do primeiro render. */
export async function loadThemePreference(): Promise<void> {
  let preference: ThemePreference = 'system';
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (isThemePreference(stored)) preference = stored;
  } catch {
    // segue com 'system' se a leitura falhar
  }
  nativewindColorScheme.set(preference);
  useThemeStore.setState({ preference, loaded: true });
}
