import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormCheckbox } from '../src/components/FormCheckbox';
import { FormField } from '../src/components/FormField';
import { KeyboardAvoidingScreen } from '../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { acceptInviteSchema, type AcceptInviteInput } from '../src/validators/team';
import { updatePassword } from '../src/features/auth/api';
import { acceptEmployeeInvite } from '../src/features/team/api';
import { useAuthStore } from '../src/features/auth/store';

/**
 * Aberta só via o link de convite de funcionário do email (deep link
 * bookingchef://accept-invite#access_token=...&type=invite), tratado em
 * src/features/auth/recovery.ts (mesmo mecanismo do "esqueci minha
 * senha" — Fase 3). V2, Épico 08, história 08.2.
 */
export default function AcceptInviteScreen() {
  const session = useAuthStore((s) => s.session);
  const setAcceptingInvite = useAuthStore((s) => s.setAcceptingInvite);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: '', confirmPassword: '', termsAccepted: false },
  });

  const onSubmit = async (data: AcceptInviteInput) => {
    if (!session) return;
    setFormError(null);
    try {
      await updatePassword(data.password);
      const invitedName =
        (session.user.user_metadata?.invited_name as string | undefined)?.trim() || session.user.email || 'Você';
      await acceptEmployeeInvite(session.user.id, session.user.email ?? '', invitedName);
      setAcceptingInvite(false);
      await refreshProfile();
      router.replace('/');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível ativar seu acesso.');
    }
  };

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <Text className="mb-3 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Você foi convidado!</Text>
      <Text className="mb-6 text-base text-ink-secondary dark:text-ink-secondary-dark">
        Crie uma senha para acessar o Booking Chef do estabelecimento que te convidou.
      </Text>

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
      <FormCheckbox control={control} name="termsAccepted" label="Li e aceito os Termos de Uso" />

      {formError ? <Text className="mb-4 text-sm text-danger dark:text-danger-dark">{formError}</Text> : null}

      <PrimaryButton label="Ativar acesso" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </KeyboardAvoidingScreen>
  );
}
