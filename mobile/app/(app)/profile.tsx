import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { BackButton } from '../../src/components/BackButton';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { deleteAccount, signOut } from '../../src/features/auth/api';
import { useAuthStore } from '../../src/features/auth/store';
import { useThemeStore, type ThemePreference } from '../../src/features/theme/store';
import { supabase } from '../../src/lib/supabase';

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

/**
 * Perfil (Fase 6): dados da conta, acesso a Termos/Privacidade, sair e
 * excluir conta (LGPD, direito de eliminação — via Edge Function
 * `delete-account`, ver src/features/auth/api.ts).
 */
export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const membership = useAuthStore((s) => s.membership);
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!membership) return;
    supabase
      .from('companies')
      .select('trade_name, legal_name')
      .eq('id', membership.company_id)
      .single()
      .then(({ data }) => {
        if (data) setCompanyName(data.trade_name || data.legal_name);
      });
  }, [membership]);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Isso apaga permanentemente sua conta, seu estabelecimento e todas as fichas técnicas — inclusive fotos. Não tem como desfazer. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir tudo',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              await signOut();
              router.replace('/login');
            } catch (error) {
              setDeleting(false);
              Alert.alert('Não foi possível excluir', error instanceof Error ? error.message : 'Tente novamente.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerClassName="px-6 py-16">
      <BackButton />
      <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">Perfil</Text>

      <View className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400">Nome</Text>
        <Text className="mb-3 text-base text-gray-900 dark:text-gray-50">{profile?.name || '—'}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">Email</Text>
        <Text className="mb-3 text-base text-gray-900 dark:text-gray-50">{profile?.email || '—'}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">Estabelecimento</Text>
        <Text className="text-base text-gray-900 dark:text-gray-50">{companyName || '—'}</Text>
      </View>

      <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">Aparência</Text>
      <View className="mb-8 flex-row gap-2">
        {THEME_OPTIONS.map((option) => {
          const selected = themePreference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => setThemePreference(option.value)}
              className={
                'min-h-[44px] flex-1 items-center justify-center rounded-full border px-3 py-2 ' +
                (selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900')
              }
            >
              <Text
                className={
                  selected ? 'text-sm font-semibold text-white' : 'text-sm text-gray-700 dark:text-gray-300'
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">Privacidade</Text>
      <View className="mb-8 gap-1">
        <Link href="/terms" asChild>
          <Text accessibilityRole="link" className="min-h-[44px] py-2 text-base text-blue-600">
            Termos de Uso
          </Text>
        </Link>
        <Link href="/privacy" asChild>
          <Text accessibilityRole="link" className="min-h-[44px] py-2 text-base text-blue-600">
            Política de Privacidade
          </Text>
        </Link>
      </View>

      <View className="mb-6">
        <PrimaryButton label="Sair" variant="outline" onPress={() => signOut()} />
      </View>

      <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
        Zona de risco
      </Text>
      <Text className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Exclui sua conta, seu estabelecimento e todas as fichas técnicas de forma permanente.
      </Text>
      <PrimaryButton
        label="Excluir minha conta"
        variant="outline"
        tone="danger"
        onPress={handleDeleteAccount}
        loading={deleting}
      />
    </ScrollView>
  );
}
