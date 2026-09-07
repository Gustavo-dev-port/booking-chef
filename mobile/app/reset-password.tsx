import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText } from '../src/components/AppText';
import { FormField } from '../src/components/FormField';
import { KeyboardAvoidingScreen } from '../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { resetPasswordSchema, type ResetPasswordInput } from '../src/validators/auth';
import { signOut, updatePassword } from '../src/features/auth/api';
import { useAuthStore } from '../src/features/auth/store';

/**
 * Aberta só via o link de "esqueci minha senha" do email (deep link
 * bookingchef://reset-password#access_token=...&type=recovery), tratado em
 * src/features/auth/recovery.ts. Depois de trocar a senha, desloga de
 * propósito — mais simples e mais seguro do que manter a sessão de
 * recuperação como se fosse um login normal.
 */
export default function ResetPasswordScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setFormError(null);
    try {
      await updatePassword(data.password);
      setDone(true);
      await signOut();
      useAuthStore.getState().setRecovering(false);
      router.replace('/login');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível trocar a senha.');
    }
  };

  if (done) {
    return (
      <ScrollView className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="flex-grow justify-center px-6">
        <AppText className="text-2xl font-archivo-bold text-ink dark:text-ink-dark">Senha atualizada!</AppText>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <AppText className="mb-3 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Nova senha</AppText>
      <AppText className="mb-6 text-base text-ink-secondary dark:text-ink-secondary-dark">Escolha uma nova senha para sua conta.</AppText>

      <FormField
        control={control}
        name="password"
        label="Nova senha"
        secureTextEntry
        showPasswordToggle
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres"
      />
      <FormField
        control={control}
        name="confirmPassword"
        label="Confirmar nova senha"
        secureTextEntry
        showPasswordToggle
        autoComplete="new-password"
      />

      {formError ? <AppText className="mb-4 text-sm text-danger dark:text-danger-dark">{formError}</AppText> : null}

      <PrimaryButton label="Salvar nova senha" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </KeyboardAvoidingScreen>
  );
}
