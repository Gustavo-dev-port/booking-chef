import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText } from '../../src/components/AppText';
import { BackButton } from '../../src/components/BackButton';
import { FormField } from '../../src/components/FormField';
import { KeyboardAvoidingScreen } from '../../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../src/validators/auth';
import { sendPasswordReset } from '../../src/features/auth/api';

export default function ForgotPasswordScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setFormError(null);
    try {
      await sendPasswordReset(data.email);
      setSent(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível enviar o email.');
    }
  };

  if (sent) {
    return (
      <ScrollView className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="flex-grow justify-center px-6">
        <BackButton />
        <AppText className="mb-3 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Email enviado</AppText>
        <AppText className="text-base text-ink-secondary dark:text-ink-secondary-dark">
          Se existir uma conta com esse email, você vai receber um link para criar uma nova senha.
        </AppText>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <BackButton />
      <AppText className="mb-3 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Esqueci minha senha</AppText>
      <AppText className="mb-6 text-base text-ink-secondary dark:text-ink-secondary-dark">
        Informe o email da sua conta. Vamos enviar um link para você criar uma nova senha.
      </AppText>

      <FormField
        control={control}
        name="email"
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      {formError ? <AppText className="mb-4 text-sm text-danger dark:text-danger-dark">{formError}</AppText> : null}

      <PrimaryButton label="Enviar link" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </KeyboardAvoidingScreen>
  );
}
