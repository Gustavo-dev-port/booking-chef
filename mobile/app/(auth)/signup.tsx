import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../../src/components/FormField';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { signupSchema, type SignupInput } from '../../src/validators/auth';
import { signUp } from '../../src/features/auth/api';

/**
 * Criar conta (Fase 3) — só cria o usuário no Supabase Auth. Nome da
 * empresa/CNPJ/etc. ficam para a tela de onboarding (grupo (onboarding)),
 * que o layout raiz mostra automaticamente assim que existir sessão sem
 * perfil/empresa ainda.
 */
export default function SignupScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupInput) => {
    setFormError(null);
    try {
      const { needsEmailConfirmation } = await signUp(data.email, data.password);
      if (needsEmailConfirmation) {
        router.replace({ pathname: '/check-email', params: { email: data.email } });
      }
      // Se não precisar confirmar email, o signUp já deixa uma sessão ativa
      // e o layout raiz redireciona sozinho pro onboarding.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <Text className="mb-8 text-2xl font-bold text-gray-900">Criar conta</Text>

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
        showPasswordToggle
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres"
      />
      <FormField
        control={control}
        name="confirmPassword"
        label="Confirmar senha"
        secureTextEntry
        showPasswordToggle
        autoComplete="new-password"
      />

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      <PrimaryButton label="Criar conta" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </ScrollView>
  );
}
