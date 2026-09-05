import '../global.css';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { startAuthListener, useAuthStore } from '../src/features/auth/store';
import { handleAuthDeepLink } from '../src/features/auth/recovery';
import { loadThemePreference, useThemeStore } from '../src/features/theme/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* "auto" = ícones da barra de status seguem o tema (claro/escuro)
          automaticamente, inclusive quando o usuário troca manualmente
          pela tela de Perfil. */}
      <StatusBar style="auto" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

/**
 * Roteamento por estado de autenticação (Fase 3), seguindo o padrão oficial
 * do Expo Router (Stack.Protected + guard) — ver
 * https://docs.expo.dev/router/advanced/authentication/.
 *
 * Estados possíveis, nessa ordem de prioridade:
 * 1. isRecovering — usuário abriu o link de "esqueci minha senha": fica
 *    preso em /reset-password mesmo já tendo uma sessão (a troca de senha
 *    cria uma sessão de recuperação; sem essa checagem o guard abaixo
 *    tiraria o usuário da tela antes de ele conseguir trocar a senha).
 * 2. isAcceptingInvite — usuário abriu o link de convite de funcionário
 *    (V2, história 08.2): fica preso em /accept-invite mesmo já tendo
 *    sessão — sem essa checagem, o guard abaixo mandaria essa sessão
 *    (sem profile ainda) pro grupo (onboarding), que cria uma empresa
 *    NOVA — errado pra quem está sendo convidado pra uma já existente.
 * 3. sem sessão → grupo (auth) (login/criar conta/esqueci senha).
 * 4. com sessão mas sem profile+empresa ainda → grupo (onboarding).
 * 5. com sessão e onboarding completo → grupo (app).
 */
function RootNavigator() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const membership = useAuthStore((s) => s.membership);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isRecovering = useAuthStore((s) => s.isRecovering);
  const isAcceptingInvite = useAuthStore((s) => s.isAcceptingInvite);
  const themeLoaded = useThemeStore((s) => s.loaded);
  const url = Linking.useURL();

  useEffect(() => {
    startAuthListener();
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (!isLoading && themeLoaded) SplashScreen.hideAsync();
  }, [isLoading, themeLoaded]);

  useEffect(() => {
    // Só navega depois que o Stack já existe (isLoading false) — chamar
    // router.replace antes disso não tem pra onde navegar ainda.
    if (isLoading) return;
    handleAuthDeepLink(url);
  }, [url, isLoading]);

  if (isLoading || !themeLoaded) return null;

  const onboardingComplete = !!profile && !!membership;
  const inSpecialAuthFlow = isRecovering || isAcceptingInvite;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ordem importa: um Stack nativo sem initialRouteName explícito usa
          o PRIMEIRO screen do array final (depois de resolver os guards)
          como tela padrão. Os 3 grupos abaixo são mutuamente exclusivos e
          exaustivos (sempre exatamente um guard é true) — por isso ficam
          primeiro, garantindo que o app sempre abre no grupo certo. Tinha
          um bug real aqui: reset-password/terms/privacy estavam
          incondicionais e ANTES dos grupos, então o app sempre abria em
          "nova senha", pra qualquer usuário, sempre — não só durante
          recuperação de senha de verdade. */}
      <Stack.Protected guard={!inSpecialAuthFlow && !session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={!inSpecialAuthFlow && !!session && !onboardingComplete}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={!inSpecialAuthFlow && !!session && onboardingComplete}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      {/* Só existe no array (e só pode virar tela padrão) durante um
          fluxo de recuperação de senha de verdade — ver isRecovering em
          src/features/auth/recovery.ts. Alcançada via router.replace em
          handleAuthDeepLink, nunca pelo anchor route. */}
      <Stack.Protected guard={isRecovering}>
        <Stack.Screen name="reset-password" />
      </Stack.Protected>

      {/* Idem, pro convite de funcionário (V2, história 08.2). */}
      <Stack.Protected guard={isAcceptingInvite}>
        <Stack.Screen name="accept-invite" />
      </Stack.Protected>

      {/* terms/privacy continuam sempre montadas (linkadas do onboarding
          e do Perfil), mas listadas por último — como os grupos acima
          sempre têm exatamente um ativo em primeiro lugar, elas nunca
          viram a tela padrão. */}
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
