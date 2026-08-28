import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from './store';

function extractRecoveryTokens(url: string): { accessToken: string; refreshToken: string } | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return null;
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  if (params.get('type') !== 'recovery') return null;
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

/**
 * Chamado a cada URL recebida pelo app (deep link — ver
 * https://docs.expo.dev/router/advanced/native-intent para o mecanismo).
 * Se for o link de "esqueci minha senha" enviado pelo Supabase
 * (`bookingchef://reset-password#access_token=...&type=recovery`), troca a
 * sessão pela sessão de recuperação e navega explicitamente para
 * /reset-password.
 *
 * Não dá pra confiar só no guard do Stack.Protected pra chegar nessa tela:
 * a URL resolve de forma assíncrona (depois do primeiro render), então o
 * "anchor route" já teria sido escolhido antes de sabermos que era um link
 * de recuperação. Por isso a navegação é feita na mão aqui.
 */
export async function handleRecoveryUrl(url: string | null): Promise<void> {
  if (!url) return;
  const tokens = extractRecoveryTokens(url);
  if (!tokens) return;

  useAuthStore.getState().setRecovering(true);
  await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  router.replace('/reset-password');
}
