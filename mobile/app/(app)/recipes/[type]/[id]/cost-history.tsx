import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../../../../src/components/BackButton';
import { listCostSnapshots, type RecipeCostSnapshot } from '../../../../../src/features/recipes/costSnapshot';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/**
 * Histórico de custo/CMV (V2, Épico 07, história 07.3) — só leitura, um
 * registro por salvamento da ficha. Nunca recalculado retroativamente:
 * se o preço de um insumo mudar depois, os snapshots antigos continuam
 * mostrando o custo de quando foram gravados.
 */
export default function RecipeCostHistoryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [snapshots, setSnapshots] = useState<RecipeCostSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCostSnapshots(params.id)
      .then(setSnapshots)
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <View className="flex-1 bg-surface-page dark:bg-surface-page-dark pt-16">
      <View className="px-4">
        <BackButton />
        <Text className="mb-4 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Histórico de custo</Text>
      </View>

      <FlatList
        data={snapshots}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-12"
        renderItem={({ item }) => (
          <View className="mb-2 rounded-xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-archivo-semibold text-ink dark:text-ink-dark">
                R$ {item.total_cost.toFixed(2)}
              </Text>
              <Text className="text-xs text-ink-secondary dark:text-ink-secondary-dark">{formatDateTime(item.calculated_at)}</Text>
            </View>
            <Text className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondary-dark">
              {item.cmv_percentage !== null ? `CMV ${item.cmv_percentage.toFixed(1)}%` : 'Sem preço de venda no momento'}
              {item.sale_price_at_snapshot ? ` · Venda R$ ${item.sale_price_at_snapshot.toFixed(2)}` : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-4 text-center text-base text-ink-secondary dark:text-ink-secondary-dark">
              Nenhum histórico ainda — salve a ficha pra começar a registrar.
            </Text>
          ) : null
        }
      />
    </View>
  );
}
