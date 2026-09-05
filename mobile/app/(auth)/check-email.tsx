import { Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';

/**
 * Mostrada só quando o projeto Supabase exige confirmação de email antes de
 * liberar a sessão (signUp não retorna sessão nesse caso). Se essa opção
 * estiver desligada no projeto, o usuário nunca passa por aqui — o signUp
 * já entrega sessão direto e o layout raiz manda pro onboarding.
 */
export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <View className="flex-1 justify-center bg-surface-card dark:bg-surface-card-dark px-6">
      <Text className="mb-3 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Confirme seu email</Text>
      <Text className="mb-8 text-base text-ink-secondary dark:text-ink-secondary-dark">
        Enviamos um link de confirmação{email ? ` para ${email}` : ''}. Abra o email e toque no link
        para poder entrar no app.
      </Text>

      <Link href="/login" asChild>
        <PrimaryButton label="Voltar para o login" variant="outline" />
      </Link>
    </View>
  );
}
