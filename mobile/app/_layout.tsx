import '../global.css';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { startAuthListener, useAuthStore } from '../src/features/auth/store';
import { handleRecoveryUrl } from '../src/features/auth/recovery';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

/**
 * Roteamento por estado de autenticação (Fase 3), seguindo o padrão oficial
 * do Expo Router (Stack.Protected + guard) — ver
 * https://docs.expo.dev/router/advanced/authentication/.
 *
 * Três estados possíveis, nessa ordem de prioridade:
 * 1. isRecovering — usuário abriu o link de "esqueci minha senha": fica
 *    preso em /reset-password mesmo já tendo uma sessão (a troca de senha
 *    cria uma sessão de recuperação; sem essa checagem o guard abaixo
 *    tiraria o usuário da tela antes de ele conseguir trocar a senha).
 * 2. sem sessão → grupo (auth) (login/criar conta/esqueci senha).
 * 3. com sessão mas sem profile+empresa ainda → grupo (onboarding).
 * 4. com sessão e onboarding completo → grupo (app).
 */
function RootNavigator() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const membership = useAuthStore((s) => s.membership);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isRecovering = useAuthStore((s) => s.isRecovering);
  const url = Linking.useURL();

  useEffect(() => {
    startAuthListener();
  }, []);

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  useEffect(() => {
    // Só navega depois que o Stack já existe (isLoading false) — chamar
    // router.replace antes disso não tem pra onde navegar ainda.
    if (isLoading) return;
    handleRecoveryUrl(url);
  }, [url, isLoading]);

  if (isLoading) return null;

  const onboardingComplete = !!profile && !!membership;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Sempre registradas (fora de qualquer guard). reset-password é
          alcançada via router.replace em handleRecoveryUrl (nunca pelo
          anchor route); terms/privacy precisam abrir tanto de dentro do
          onboarding quanto da tela de Perfil, então não fazem sentido
          dentro de um grupo protegido específico. */}
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />

      <Stack.Protected guard={!isRecovering && !session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={!isRecovering && !!session && !onboardingComplete}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={!isRecovering && !!session && onboardingComplete}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
