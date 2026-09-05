import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from './store';

type RecoveryLinkType = 'recovery' | 'invite';

function extractTokens(url: string, expectedType: RecoveryLinkType): { accessToken: string; refreshToken: string } | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return null;
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  if (params.get('type') !== expectedType) return null;
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

/**
 * Chamado a cada URL recebida pelo app (deep link — ver
 * https://docs.expo.dev/router/advanced/native-intent para o mecanismo).
 * Trata os dois links de auth que o Supabase manda por email, os dois
 * identificados pelo `type` no hash da URL:
 *
 * - "esqueci minha senha" (`bookingchef://reset-password#...&type=recovery`,
 *   Fase 3) → /reset-password.
 * - convite de funcionário (`bookingchef://accept-invite#...&type=invite`,
 *   V2, história 08.2) → /accept-invite.
 *
 * Não dá pra confiar só no guard do Stack.Protected pra chegar nessas
 * telas: a URL resolve de forma assíncrona (depois do primeiro render),
 * então o "anchor route" já teria sido escolhido antes de sabermos que
 * era um link de recuperação/convite. Por isso a navegação é feita na
 * mão aqui, e cada fluxo tem sua própria flag (isRecovering/
 * isAcceptingInvite) pro guard do layout raiz não tratar a sessão criada
 * pelo link como um login normal.
 */
export async function handleAuthDeepLink(url: string | null): Promise<void> {
  if (!url) return;

  const recoveryTokens = extractTokens(url, 'recovery');
  if (recoveryTokens) {
    useAuthStore.getState().setRecovering(true);
    await supabase.auth.setSession({
      access_token: recoveryTokens.accessToken,
      refresh_token: recoveryTokens.refreshToken,
    });
    router.replace('/reset-password');
    return;
  }

  const inviteTokens = extractTokens(url, 'invite');
  if (inviteTokens) {
    useAuthStore.getState().setAcceptingInvite(true);
    await supabase.auth.setSession({
      access_token: inviteTokens.accessToken,
      refresh_token: inviteTokens.refreshToken,
    });
    router.replace('/accept-invite');
  }
}
