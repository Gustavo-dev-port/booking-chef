import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../../../src/components/FormField';
import { KeyboardAvoidingScreen } from '../../../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { employeeInviteSchema, type EmployeeInviteInput } from '../../../src/validators/team';
import { inviteEmployee, listEmployees, removeEmployeeAccess, type Employee } from '../../../src/features/team/api';
import { EMPLOYEE_ROLES, employeeRoleLabel, employeeStatusLabel } from '../../../src/features/team/role';
import { useAuthStore } from '../../../src/features/auth/store';
import { canManageBusiness, resolveAppRole } from '../../../src/features/team/permissions';
import { useRoleGuard } from '../../../src/hooks/useRoleGuard';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/**
 * Equipe (V2, Épico 08 — convidar (08.1), listar, remover acesso
 * (08.4)). Lista + formulário de convite na mesma tela, mesmo padrão de
 * app/(app)/inventory/[id]/movements.tsx.
 *
 * V2, história 08.3 — só proprietario/gerente acessam a tela (useRoleGuard
 * abaixo); "Convidar" e "Remover acesso" ficam restritos ainda mais, só
 * ao proprietário (mesma regra da RLS de employees_update/da Edge
 * Function invite-employee).
 */
export default function TeamScreen() {
  const membership = useAuthStore((s) => s.membership);
  const companyId = membership?.company_id;
  const isOwner = membership?.is_owner ?? false;
  useRoleGuard(canManageBusiness(resolveAppRole(membership)));

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

  const handleRemoveAccess = (employee: Employee) => {
    Alert.alert(
      'Remover acesso',
      `${employee.name} não vai mais conseguir entrar no Booking Chef deste estabelecimento. As fichas técnicas e movimentações que essa pessoa criou continuam no histórico. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover acesso',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeEmployeeAccess(employee.id);
              await load();
            } catch (error) {
              Alert.alert('Não foi possível remover', error instanceof Error ? error.message : 'Tente novamente.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-surface-page dark:bg-surface-page-dark" contentContainerClassName="px-4 pb-24 pt-16">
      <Text className="mb-6 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Equipe</Text>

      {isOwner ? (
        <View className="mb-8 rounded-2xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-4">
          <Text className="mb-3 text-base font-archivo-semibold text-ink dark:text-ink-dark">
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

          <Text className="mb-1 text-base text-ink dark:text-ink-dark">Cargo</Text>
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
                    (selected ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
                  }
                >
                  <Text className={selected ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {formError ? <Text className="mb-3 text-sm text-danger dark:text-danger-dark">{formError}</Text> : null}
          {success ? <Text className="mb-3 text-sm text-success dark:text-success-dark">{success}</Text> : null}

          <PrimaryButton label="Enviar convite" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      ) : null}

      <Text className="mb-3 text-base font-archivo-semibold text-ink dark:text-ink-dark">
        {isOwner ? 'Convites e equipe' : 'Equipe'}
      </Text>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View className="mb-2 rounded-xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-base font-archivo-semibold text-ink dark:text-ink-dark" numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                className={
                  'text-xs font-archivo-semibold ' + (item.status === 'ativo' ? 'text-success dark:text-success-dark' : 'text-ink-secondary dark:text-ink-secondary-dark')
                }
              >
                {employeeStatusLabel(item.status)}
              </Text>
            </View>
            <Text className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondary-dark" numberOfLines={1}>
              {item.email} · {employeeRoleLabel(item.role)}
            </Text>
            <Text className="mt-1 text-xs text-ink-secondary dark:text-ink-secondary-dark">
              Convidado em {formatDate(item.invited_at)}
            </Text>
            {isOwner && item.status !== 'removido' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover acesso de ${item.name}`}
                onPress={() => handleRemoveAccess(item)}
                className="mt-2 min-h-[32px] self-start justify-center"
              >
                <Text className="text-sm font-archivo-medium text-danger dark:text-danger-dark">Remover acesso</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-center text-base text-ink-secondary dark:text-ink-secondary-dark">
              {isOwner ? 'Nenhum convite enviado ainda.' : 'Nenhum funcionário cadastrado ainda.'}
            </Text>
          ) : null
        }
      />
    </KeyboardAvoidingScreen>
  );
}
