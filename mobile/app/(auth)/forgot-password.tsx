import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
      <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerClassName="flex-grow justify-center px-6">
        <BackButton />
        <Text className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-50">Email enviado</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Se existir uma conta com esse email, você vai receber um link para criar uma nova senha.
        </Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-white dark:bg-gray-900" contentContainerClassName="flex-grow justify-center px-6 py-12">
      <BackButton />
      <Text className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-50">Esqueci minha senha</Text>
      <Text className="mb-6 text-base text-gray-500 dark:text-gray-400">
        Informe o email da sua conta. Vamos enviar um link para você criar uma nova senha.
      </Text>

      <FormField
        control={control}
        name="email"
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      <PrimaryButton label="Enviar link" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </KeyboardAvoidingScreen>
  );
}
