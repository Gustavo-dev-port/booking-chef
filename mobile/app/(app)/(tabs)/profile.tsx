import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { deleteAccount, signOut } from '../../../src/features/auth/api';
import { useAuthStore } from '../../../src/features/auth/store';
import { useThemeStore, type ThemePreference } from '../../../src/features/theme/store';
import { supabase } from '../../../src/lib/supabase';

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
    <ScrollView className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="px-6 py-16">
      <Text className="mb-6 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Perfil</Text>

      <View className="mb-8 rounded-2xl border border-surface-border dark:border-surface-border-dark p-4">
        <Text className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Nome</Text>
        <Text className="mb-3 text-base text-ink dark:text-ink-dark">{profile?.name || '—'}</Text>
        <Text className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Email</Text>
        <Text className="mb-3 text-base text-ink dark:text-ink-dark">{profile?.email || '—'}</Text>
        <Text className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Estabelecimento</Text>
        <Text className="text-base text-ink dark:text-ink-dark">{companyName || '—'}</Text>
      </View>

      <Text className="mb-3 text-base font-archivo-semibold text-ink dark:text-ink-dark">Aparência</Text>
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
                (selected ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
              }
            >
              <Text
                className={
                  selected ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-3 text-base font-archivo-semibold text-ink dark:text-ink-dark">Privacidade</Text>
      <View className="mb-8 gap-1">
        <Link href="/terms" asChild>
          <Text accessibilityRole="link" className="min-h-[44px] py-2 text-base text-brand dark:text-brand-dark">
            Termos de Uso
          </Text>
        </Link>
        <Link href="/privacy" asChild>
          <Text accessibilityRole="link" className="min-h-[44px] py-2 text-base text-brand dark:text-brand-dark">
            Política de Privacidade
          </Text>
        </Link>
      </View>

      <View className="mb-6">
        <PrimaryButton label="Sair" variant="outline" onPress={() => signOut()} />
      </View>

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
