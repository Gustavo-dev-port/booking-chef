import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../../src/components/FormField';
import { FormChipSelect } from '../../src/components/FormChipSelect';
import { FormCheckbox } from '../../src/components/FormCheckbox';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { EMPLOYEE_RANGES, SEGMENTS, onboardingSchema, type OnboardingInput } from '../../src/validators/onboarding';
import { completeOnboarding } from '../../src/features/auth/api';
import { useAuthStore } from '../../src/features/auth/store';

/**
 * Onboarding completo (Fase 3): dados do usuário + dados da empresa numa
 * tela só (o app mobile não tem o wizard de 4 etapas do app web — nenhuma
 * tela intermediária ganha nada fazendo isso em 4 telas aqui). Ao salvar,
 * cria o profile e a empresa (via completeOnboarding); o layout raiz
 * detecta profile+empresa prontos e libera o grupo (app) sozinho.
 */
export default function CompanyOnboardingScreen() {
  const session = useAuthStore((s) => s.session);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      phone: '',
      cnpj: '',
      legalName: '',
      tradeName: '',
      segment: undefined,
      employeeRange: undefined,
      city: '',
      state: '',
      termsAccepted: false,
      marketingOptIn: false,
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    if (!session) return;
    setFormError(null);
    try {
      await completeOnboarding(session.user.id, session.user.email ?? '', data);
      await refreshProfile();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-16">
      <Text className="mb-1 text-2xl font-bold text-gray-900">Complete seu cadastro</Text>
      <Text className="mb-6 text-base text-gray-500">
        Precisamos de mais alguns dados seus e do seu estabelecimento.
      </Text>

      <Text className="mb-3 text-base font-semibold text-gray-900">Você</Text>
      <FormField control={control} name="name" label="Seu nome" autoComplete="name" />
      <FormField control={control} name="phone" label="Telefone (opcional)" keyboardType="phone-pad" />

      <Text className="mb-3 mt-2 text-base font-semibold text-gray-900">Estabelecimento</Text>
      <FormField
        control={control}
        name="cnpj"
        label="CNPJ"
        keyboardType="number-pad"
        maxLength={18}
      />
      <FormField control={control} name="legalName" label="Razão social" />
      <FormField control={control} name="tradeName" label="Nome fantasia (opcional)" />
      <FormChipSelect control={control} name="segment" label="Segmento" options={SEGMENTS} />
      <FormChipSelect
        control={control}
        name="employeeRange"
        label="Tamanho do negócio"
        options={EMPLOYEE_RANGES}
      />
      <FormField control={control} name="city" label="Cidade" />
      <FormField control={control} name="state" label="UF" autoCapitalize="characters" maxLength={2} />

      <View className="mb-1 flex-row gap-4">
        <Link href="/terms" asChild>
          <Text className="min-h-[44px] text-sm text-blue-600" accessibilityRole="link">
            Ler Termos de Uso
          </Text>
        </Link>
        <Link href="/privacy" asChild>
          <Text className="min-h-[44px] text-sm text-blue-600" accessibilityRole="link">
            Ler Política de Privacidade
          </Text>
        </Link>
      </View>
      <FormCheckbox control={control} name="termsAccepted" label="Li e aceito os Termos de Uso" />
      <FormCheckbox
        control={control}
        name="marketingOptIn"
        label="Quero receber novidades e ofertas por email"
      />

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      <PrimaryButton label="Concluir cadastro" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </ScrollView>
  );
}
