import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '../../../src/components/BackButton';
import { FormField } from '../../../src/components/FormField';
import { KeyboardAvoidingScreen } from '../../../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { employeeInviteSchema, type EmployeeInviteInput } from '../../../src/validators/team';
import { inviteEmployee, listEmployees, type Employee } from '../../../src/features/team/api';
import { EMPLOYEE_ROLES, employeeRoleLabel, employeeStatusLabel } from '../../../src/features/team/role';
import { useAuthStore } from '../../../src/features/auth/store';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/**
 * Equipe (V2, Épico 08, história 08.1 — convite de funcionário). Lista +
 * formulário de convite na mesma tela, mesmo padrão de
 * app/(app)/inventory/[id]/movements.tsx.
 *
 * Escopo desta história: só criar e mandar o convite (via Edge Function
 * invite-employee) e listar quem já foi convidado/está ativo. Ativar a
 * conta convidada (08.2) e restringir acesso por papel (08.3) são
 * Sprint 5 — até lá, um convite não dá nenhum acesso a dado da empresa.
 */
export default function TeamScreen() {
  const companyId = useAuthStore((s) => s.membership?.company_id);
  const isOwner = useAuthStore((s) => s.membership?.is_owner ?? false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<EmployeeInviteInput>({
    resolver: zodResolver(employeeInviteSchema),
    defaultValues: { name: '', email: '', role: 'bartender' },
  });
  const selectedRole = watch('role');

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      setEmployees(await listEmployees(companyId));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSubmit = async (data: EmployeeInviteInput) => {
    setFormError(null);
    setSuccess(null);
    try {
      await inviteEmployee(data);
      setSuccess(`Convite enviado para ${data.email}.`);
      reset({ name: '', email: '', role: 'bartender' });
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível convidar.');
    }
  };

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerClassName="px-4 pb-24 pt-16">
      <BackButton />
      <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">Equipe</Text>

      {isOwner ? (
        <View className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">
            Convidar funcionário
          </Text>

          <FormField control={control} name="name" label="Nome" />
          <FormField
            control={control}
            name="email"
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          <Text className="mb-1 text-base text-gray-700 dark:text-gray-300">Cargo</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {EMPLOYEE_ROLES.map((option) => {
              const selected = selectedRole === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  onPress={() => setValue('role', option.value)}
                  className={
                    'min-h-[44px] items-center justify-center rounded-full border px-4 py-2 ' +
                    (selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900')
                  }
                >
                  <Text className={selected ? 'text-sm font-semibold text-white' : 'text-sm text-gray-700 dark:text-gray-300'}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}
          {success ? <Text className="mb-3 text-sm text-green-600">{success}</Text> : null}

          <PrimaryButton label="Enviar convite" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      ) : null}

      <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">
        {isOwner ? 'Convites e equipe' : 'Equipe'}
      </Text>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View className="mb-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-base font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                className={
                  'text-xs font-semibold ' + (item.status === 'ativo' ? 'text-green-600' : 'text-gray-500 dark:text-gray-400')
                }
              >
                {employeeStatusLabel(item.status)}
              </Text>
            </View>
            <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {item.email} · {employeeRoleLabel(item.role)}
            </Text>
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Convidado em {formatDate(item.invited_at)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-base text-gray-500 dark:text-gray-400">
              {isOwner ? 'Nenhum convite enviado ainda.' : 'Nenhum funcionário cadastrado ainda.'}
            </Text>
          ) : null
        }
      />
    </KeyboardAvoidingScreen>
  );
}
