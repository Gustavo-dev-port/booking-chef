import { useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText } from '../../src/components/AppText';
import { FormField } from '../../src/components/FormField';
import { FormChipSelect } from '../../src/components/FormChipSelect';
import { FormCheckbox } from '../../src/components/FormCheckbox';
import { KeyboardAvoidingScreen } from '../../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { EMPLOYEE_RANGES, SEGMENTS, onboardingSchema, type OnboardingInput } from '../../src/validators/onboarding';
import { isValidCnpj, normalizeCnpj } from '../../src/validators/cnpj';
import { completeOnboarding } from '../../src/features/auth/api';
import { lookupCnpj } from '../../src/features/onboarding/cnpjLookup';
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
  const [cnpjLookupError, setCnpjLookupError] = useState<string | null>(null);
  const [lookingUpCnpj, setLookingUpCnpj] = useState(false);
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
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

  const handleLookupCnpj = async () => {
    setCnpjLookupError(null);
    const digits = normalizeCnpj(getValues('cnpj'));
    if (!isValidCnpj(digits)) {
      setCnpjLookupError('Digite um CNPJ válido antes de buscar.');
      return;
    }

    setLookingUpCnpj(true);
    try {
      const result = await lookupCnpj(digits);
      if (!result) {
        setCnpjLookupError('Não encontramos esse CNPJ. Preencha os dados manualmente.');
        return;
      }
      setValue('legalName', result.legalName, { shouldValidate: true });
      if (result.tradeName) setValue('tradeName', result.tradeName, { shouldValidate: true });
      if (result.city) setValue('city', result.city, { shouldValidate: true });
      if (result.state) setValue('state', result.state, { shouldValidate: true });
    } finally {
      setLookingUpCnpj(false);
    }
  };

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
    <KeyboardAvoidingScreen className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="px-6 py-16">
      <AppText className="mb-1 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Complete seu cadastro</AppText>
      <AppText className="mb-6 text-base text-ink-secondary dark:text-ink-secondary-dark">
        Precisamos de mais alguns dados seus e do seu estabelecimento.
      </AppText>

      <AppText className="mb-3 text-base font-archivo-semibold text-ink dark:text-ink-dark">Você</AppText>
      <FormField control={control} name="name" label="Seu nome" autoComplete="name" />
      <FormField control={control} name="phone" label="Telefone (opcional)" keyboardType="phone-pad" />

      <AppText className="mb-3 mt-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Estabelecimento</AppText>
      <FormField control={control} name="cnpj" label="CNPJ" keyboardType="number-pad" maxLength={18} />
      <View className="mb-4">
        <PrimaryButton
          label="Buscar dados da empresa"
          variant="outline"
          onPress={handleLookupCnpj}
          loading={lookingUpCnpj}
        />
        {cnpjLookupError ? <AppText className="mt-2 text-sm text-danger dark:text-danger-dark">{cnpjLookupError}</AppText> : null}
      </View>

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
          <AppText className="min-h-[44px] text-sm text-brand dark:text-brand-dark" accessibilityRole="link">
            Ler Termos de Uso
          </AppText>
        </Link>
        <Link href="/privacy" asChild>
          <AppText className="min-h-[44px] text-sm text-brand dark:text-brand-dark" accessibilityRole="link">
            Ler Política de Privacidade
          </AppText>
        </Link>
      </View>
      <FormCheckbox control={control} name="termsAccepted" label="Li e aceito os Termos de Uso" />
      <FormCheckbox
        control={control}
        name="marketingOptIn"
        label="Quero receber novidades e ofertas por email"
      />

      {formError ? <AppText className="mb-4 text-sm text-danger dark:text-danger-dark">{formError}</AppText> : null}

      <PrimaryButton label="Concluir cadastro" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </KeyboardAvoidingScreen>
  );
}
