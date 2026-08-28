import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../../src/components/FormField';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { loginSchema, type LoginInput } from '../../src/validators/auth';
import { signIn } from '../../src/features/auth/api';

/**
 * Login (Fase 3) — chama supabase.auth.signInWithPassword de verdade. Se
 * der certo, o layout raiz (app/_layout.tsx) já redireciona sozinho pro
 * onboarding ou pro app, olhando a sessão — nenhuma navegação manual aqui.
 */
export default function LoginScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <Text className="mb-8 text-2xl font-bold text-gray-900">Entrar</Text>

      <FormField
        control={control}
        name="email"
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <FormField
        control={control}
        name="password"
        label="Senha"
        secureTextEntry
        autoComplete="current-password"
      />

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      <View className="mb-3">
        <PrimaryButton label="Entrar" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>

      <Link href="/forgot-password" asChild>
        <Text
          accessibilityRole="link"
          className="mb-3 min-h-[44px] py-3 text-center text-sm text-blue-600"
        >
          Esqueci minha senha
        </Text>
      </Link>

      <Link href="/signup" asChild>
        <PrimaryButton label="Criar conta" variant="outline" />
      </Link>
    </ScrollView>
  );
}
