import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../../../src/components/BackButton';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { getInventoryItem, type InventoryItem } from '../../../../src/features/inventory/api';
import { listMovements, registerMovement, type InventoryMovement } from '../../../../src/features/inventory/movements';
import { MOVEMENT_TYPES, movementTypeLabel, type MovementType } from '../../../../src/features/inventory/movementType';
import { useAuthStore } from '../../../../src/features/auth/store';
import { ingredientUnitLabel } from '../../../../src/validators/recipe';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/**
 * Lançar movimentação (06.2) + histórico (06.3), numa tela só — insumo
 * único, faz sentido gerenciar os dois juntos. "Autor" no histórico: por
 * enquanto todo insumo só tem o próprio dono lançando (Equipe é Sprint 4,
 * ainda não existe usuário B numa mesma empresa) — quando isso mudar,
 * resolver nome de outro autor vai precisar de uma função/view própria,
 * já que `profiles` só é legível pelo próprio dono da linha (RLS).
 */
export default function InventoryMovementsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<MovementType>('entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemResult, movementsResult] = await Promise.all([
        getInventoryItem(params.id),
        listMovements(params.id),
      ]);
      setItem(itemResult);
      setMovements(movementsResult);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSubmit = async () => {
    setFormError(null);
    const parsedQuantity = Number(quantity.replace(',', '.'));
    if (!quantity.trim() || Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      setFormError('Informe uma quantidade válida.');
      return;
    }

    setSubmitting(true);
    try {
      await registerMovement(params.id, type, parsedQuantity, reason.trim() || undefined);
      setQuantity('');
      setReason('');
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível lançar a movimentação.');
    } finally {
      setSubmitting(false);
    }
  };

  const unitLabel = item ? ingredientUnitLabel(item.usage_unit) : '';

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 pt-16">
      <View className="px-4">
        <BackButton />
        <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{item?.name ?? 'Insumo'}</Text>
        {item ? (
          <Text className="mb-4 text-base text-gray-500 dark:text-gray-400">
            Saldo atual: {item.current_quantity} {unitLabel}
          </Text>
        ) : null}

        <View className="mb-4 flex-row flex-wrap gap-2">
          {MOVEMENT_TYPES.map((option) => {
            const selected = type === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => setType(option.value)}
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

        <Text className="mb-1 text-base text-gray-700 dark:text-gray-300">
          {type === 'ajuste' ? `Novo saldo contado (${unitLabel})` : `Quantidade (${unitLabel})`}
        </Text>
        <TextInput
          accessibilityLabel="Quantidade"
          keyboardType="decimal-pad"
          value={quantity}
          onChangeText={setQuantity}
          className="mb-3 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-base text-gray-900 dark:text-gray-50"
        />

        <Text className="mb-1 text-base text-gray-700 dark:text-gray-300">Motivo (opcional)</Text>
        <TextInput
          accessibilityLabel="Motivo"
          value={reason}
          onChangeText={setReason}
          className="mb-3 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-base text-gray-900 dark:text-gray-50"
        />

        {formError ? <Text className="mb-3 text-sm text-red-600">{formError}</Text> : null}

        <View className="mb-6">
          <PrimaryButton label="Lançar movimentação" onPress={handleSubmit} loading={submitting} />
        </View>

        <Text className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-50">Histórico</Text>
      </View>

      <FlatList
        data={movements}
        keyExtractor={(movement) => movement.id}
        contentContainerClassName="px-4 pb-12"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item: movement }) => (
          <View className="mb-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {movementTypeLabel(movement.type)}
              </Text>
              <Text className="text-base text-gray-900 dark:text-gray-50">
                {movement.quantity} {unitLabel}
              </Text>
            </View>
            {movement.reason ? (
              <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{movement.reason}</Text>
            ) : null}
            <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {movement.created_by === session?.user.id ? profile?.name || 'Você' : 'Outro usuário'} ·{' '}
              {formatDate(movement.created_at)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-4 text-center text-base text-gray-500 dark:text-gray-400">
              Nenhuma movimentação lançada ainda.
            </Text>
          ) : null
        }
      />
    </View>
  );
}
