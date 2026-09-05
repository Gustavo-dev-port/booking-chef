import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { BackButton } from '../../../src/components/BackButton';
import { InventoryItemCard } from '../../../src/components/InventoryItemCard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { listCategories, listInventoryItems, type InventoryItem, type NamedOption } from '../../../src/features/inventory/api';
import { useAuthStore } from '../../../src/features/auth/store';
import { canManageBusiness, resolveAppRole } from '../../../src/features/team/permissions';
import { useRoleGuard } from '../../../src/hooks/useRoleGuard';

type FilterMode = 'all' | 'lowStock';

/**
 * Lista de insumos em estoque (V2, Épico 06). Mesmo padrão de volume
 * pequeno + filtro em memória já usado na lista de fichas técnicas — ver
 * app/(app)/recipes/[type]/index.tsx.
 *
 * V2, história 08.3 — Estoque só pra proprietario/gerente (ver
 * src/features/team/permissions.ts); reforça na interface o que a RLS
 * de `ingredients` já bloqueia de verdade.
 */
export default function InventoryListScreen() {
  const membership = useAuthStore((s) => s.membership);
  const companyId = membership?.company_id;
  useRoleGuard(canManageBusiness(resolveAppRole(membership)));

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<NamedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [itemsResult, categoriesResult] = await Promise.all([
        listInventoryItems(companyId),
        listCategories(companyId),
      ]);
      setItems(itemsResult);
      setCategories(categoriesResult);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const lowStockCount = useMemo(
    () => items.filter((i) => i.current_quantity < i.minimum_quantity).length,
    [items]
  );

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !term || item.name.toLowerCase().includes(term);
      const matchesFilter = filter === 'all' || item.current_quantity < item.minimum_quantity;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 pt-16">
      <View className="px-4">
        <BackButton />
        <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">Estoque</Text>

        <TextInput
          accessibilityLabel="Buscar por nome"
          placeholder="Buscar por nome"
          value={search}
          onChangeText={setSearch}
          className="mb-3 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-base text-gray-900 dark:text-gray-50"
        />

        <View className="mb-3 flex-row gap-2">
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Todos os insumos"
            accessibilityState={{ selected: filter === 'all' }}
            onPress={() => setFilter('all')}
            className={
              'min-h-[44px] flex-1 items-center justify-center rounded-full border px-3 py-2 ' +
              (filter === 'all' ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900')
            }
          >
            <Text className={filter === 'all' ? 'text-sm font-semibold text-white' : 'text-sm text-gray-700 dark:text-gray-300'}>
              Todos
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Insumos abaixo do mínimo"
            accessibilityState={{ selected: filter === 'lowStock' }}
            onPress={() => setFilter('lowStock')}
            className={
              'min-h-[44px] flex-1 items-center justify-center rounded-full border px-3 py-2 ' +
              (filter === 'lowStock' ? 'border-red-600 bg-red-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900')
            }
          >
            <Text className={filter === 'lowStock' ? 'text-sm font-semibold text-white' : 'text-sm text-gray-700 dark:text-gray-300'}>
              Abaixo do mínimo{lowStockCount > 0 ? ` (${lowStockCount})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-24"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Link href={`/inventory/${item.id}`} asChild>
            <InventoryItemCard item={item} categoryName={item.category_id ? categoryNameById.get(item.category_id) ?? null : null} onPress={() => {}} />
          </Link>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-12 items-center px-6">
              <Text className="mb-4 text-center text-base text-gray-500 dark:text-gray-400">
                {filter === 'lowStock'
                  ? 'Nenhum insumo abaixo do mínimo — tudo em dia.'
                  : 'Você ainda não possui nenhum insumo cadastrado'}
              </Text>
              {filter === 'all' ? (
                <Link href="/inventory/new" asChild>
                  <PrimaryButton label="Cadastrar primeiro insumo" />
                </Link>
              ) : null}
            </View>
          ) : null
        }
      />

      {visibleItems.length > 0 ? (
        <Link href="/inventory/new" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cadastrar novo insumo"
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg active:bg-blue-700"
          >
            <Text className="text-2xl text-white">+</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
