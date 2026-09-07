import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, router, useFocusEffect } from 'expo-router';
import { AppText } from '../../../src/components/AppText';
import { InventoryItemCard } from '../../../src/components/InventoryItemCard';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import {
  archiveInventoryItem,
  listCategories,
  listInventoryItems,
  type InventoryItem,
  type NamedOption,
} from '../../../src/features/inventory/api';
import { useAuthStore } from '../../../src/features/auth/store';
import { canManageBusiness, resolveAppRole } from '../../../src/features/team/permissions';
import { useRoleGuard } from '../../../src/hooks/useRoleGuard';
import { listEntranceDelay } from '../../../src/features/ui/listEntrance';

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
  // Seleção em massa (pedido do usuário: limpar itens duplicados/repetidos
  // rápido, sem precisar arquivar um por um).
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archiving, setArchiving] = useState(false);

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

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleArchiveSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    Alert.alert(
      'Arquivar insumos selecionados',
      `${count} insumo${count > 1 ? 's vão' : ' vai'} sumir da lista, mas ficam preservados no histórico. Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          style: 'destructive',
          onPress: async () => {
            setArchiving(true);
            try {
              await Promise.all(Array.from(selectedIds).map((id) => archiveInventoryItem(id)));
              setSelectMode(false);
              setSelectedIds(new Set());
              await load();
            } catch (error) {
              Alert.alert('Não foi possível arquivar', error instanceof Error ? error.message : 'Tente novamente.');
            } finally {
              setArchiving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-surface-page dark:bg-surface-page-dark pt-16">
      <View className="px-4">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-archivo-bold text-ink dark:text-ink-dark">Estoque</AppText>
          {visibleItems.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={toggleSelectMode} className="min-h-[44px] justify-center">
              <AppText className="text-sm font-archivo-medium text-brand dark:text-brand-dark">{selectMode ? 'Cancelar' : 'Selecionar'}</AppText>
            </Pressable>
          ) : null}
        </View>

        <TextInput
          accessibilityLabel="Buscar por nome"
          placeholder="Buscar por nome"
          value={search}
          onChangeText={setSearch}
          className="mb-3 min-h-[44px] rounded-xl border border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark px-4 text-base text-ink dark:text-ink-dark"
        />

        <View className="mb-3 flex-row gap-2">
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Todos os insumos"
            accessibilityState={{ selected: filter === 'all' }}
            onPress={() => setFilter('all')}
            className={
              'min-h-[44px] flex-1 items-center justify-center rounded-full border px-3 py-2 ' +
              (filter === 'all' ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
            }
          >
            <AppText className={filter === 'all' ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'}>
              Todos
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Insumos abaixo do mínimo"
            accessibilityState={{ selected: filter === 'lowStock' }}
            onPress={() => setFilter('lowStock')}
            className={
              'min-h-[44px] flex-1 items-center justify-center rounded-full border px-3 py-2 ' +
              (filter === 'lowStock' ? 'border-danger dark:border-danger-dark bg-danger dark:bg-danger-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
            }
          >
            <AppText className={filter === 'lowStock' ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'}>
              Abaixo do mínimo{lowStockCount > 0 ? ` (${lowStockCount})` : ''}
            </AppText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-24"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(listEntranceDelay(index)).duration(220)}>
            {selectMode ? (
              <View className="flex-row items-center gap-3">
                <View
                  accessibilityElementsHidden
                  className={
                    'h-6 w-6 items-center justify-center rounded-full border-2 ' +
                    (selectedIds.has(item.id) ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark')
                  }
                >
                  {selectedIds.has(item.id) ? <AppText className="text-xs font-archivo-bold text-white">✓</AppText> : null}
                </View>
                <View className="flex-1">
                  <InventoryItemCard
                    item={item}
                    categoryName={item.category_id ? categoryNameById.get(item.category_id) ?? null : null}
                    onPress={() => toggleSelected(item.id)}
                  />
                </View>
              </View>
            ) : (
              <Link href={`/inventory/${item.id}`} asChild>
                <InventoryItemCard item={item} categoryName={item.category_id ? categoryNameById.get(item.category_id) ?? null : null} onPress={() => {}} />
              </Link>
            )}
          </Animated.View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-12 items-center px-6">
              <AppText className="mb-4 text-center text-base text-ink-secondary dark:text-ink-secondary-dark">
                {filter === 'lowStock'
                  ? 'Nenhum insumo abaixo do mínimo — tudo em dia.'
                  : 'Você ainda não possui nenhum insumo cadastrado'}
              </AppText>
              {filter === 'all' ? (
                <Link href="/inventory/new" asChild>
                  <PrimaryButton label="Cadastrar primeiro insumo" />
                </Link>
              ) : null}
            </View>
          ) : null
        }
      />

      {selectMode ? (
        <View className="absolute bottom-6 left-4 right-4">
          <PrimaryButton
            label={selectedIds.size > 0 ? `Arquivar selecionados (${selectedIds.size})` : 'Selecione um ou mais insumos'}
            onPress={handleArchiveSelected}
            disabled={selectedIds.size === 0}
            loading={archiving}
          />
        </View>
      ) : visibleItems.length > 0 ? (
        <Link href="/inventory/new" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cadastrar novo insumo"
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-brand dark:bg-brand-dark shadow-lg active:bg-brand-pressed dark:active:bg-brand-dark"
          >
            <AppText className="text-2xl text-white">+</AppText>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
