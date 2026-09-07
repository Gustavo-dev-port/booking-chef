import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { AppText } from '../../../../src/components/AppText';
import { BackButton } from '../../../../src/components/BackButton';
import { RecipeCard } from '../../../../src/components/RecipeCard';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { listRecipes, type RecipeSummary } from '../../../../src/features/recipes/api';
import { useAuthStore } from '../../../../src/features/auth/store';
import { canAccessRecipeType, canWriteRecipes, resolveAppRole } from '../../../../src/features/team/permissions';
import { useRoleGuard } from '../../../../src/hooks/useRoleGuard';
import { isRecipeType, RECIPE_TYPE_LABELS } from '../../../../src/validators/recipe';
import { listEntranceDelay } from '../../../../src/features/ui/listEntrance';

type SortMode = 'name' | 'recent';

/**
 * Lista de fichas — mesma tela pra Bar e Cozinha, filtrada por `type` (ver
 * FASE1-ARQUITETURA-MOBILE.md, seção 5). Volume esperado por empresa é
 * pequeno (dezenas de fichas, não milhares), então busca/filtro/ordenação
 * são feitos em memória sobre a lista já carregada, sem round-trip novo a
 * cada tecla — mais simples e mais rápido que buscar no servidor a cada
 * mudança, sem precisar de uma lib de cache (o projeto não usa TanStack
 * Query, só Zustand).
 */
export default function RecipeListScreen() {
  const params = useLocalSearchParams<{ type: string }>();
  const rawType = params.type ?? '';
  const type = isRecipeType(rawType) ? rawType : 'bar';
  const membership = useAuthStore((s) => s.membership);
  const companyId = membership?.company_id;
  const role = useMemo(() => resolveAppRole(membership), [membership]);
  useRoleGuard(canAccessRecipeType(role, type));

  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('recent');

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      setRecipes(await listRecipes(companyId, type));
    } finally {
      setLoading(false);
    }
  }, [companyId, type]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const categories = useMemo(
    () => Array.from(new Set(recipes.map((r) => r.category).filter((c): c is string => !!c))).sort(),
    [recipes]
  );

  const visibleRecipes = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = recipes.filter((r) => {
      const matchesSearch = !term || r.name.toLowerCase().includes(term);
      const matchesCategory = !category || r.category === category;
      return matchesSearch && matchesCategory;
    });
    list = [...list].sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    return list;
  }, [recipes, search, category, sort]);

  return (
    <View className="flex-1 bg-surface-page dark:bg-surface-page-dark pt-16">
      <View className="px-4">
        <BackButton />
        <AppText className="mb-4 text-2xl font-archivo-bold text-ink dark:text-ink-dark">{RECIPE_TYPE_LABELS[type]}</AppText>

        <TextInput
          accessibilityLabel="Buscar por nome"
          placeholder="Buscar por nome"
          value={search}
          onChangeText={setSearch}
          className="mb-3 min-h-[44px] rounded-xl border border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark px-4 text-base"
        />

        {categories.length > 0 ? (
          <View className="mb-3 flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel="Todas as categorias"
              accessibilityState={{ selected: category === null }}
              onPress={() => setCategory(null)}
              className={
                'min-h-[44px] items-center justify-center rounded-full border px-3 py-1 ' +
                (category === null ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
              }
            >
              <AppText className={category === null ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'}>
                Todas
              </AppText>
            </Pressable>
            {categories.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="radio"
                accessibilityLabel={c}
                accessibilityState={{ selected: category === c }}
                onPress={() => setCategory(c)}
                className={
                  'min-h-[44px] items-center justify-center rounded-full border px-3 py-1 ' +
                  (category === c ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
                }
              >
                <AppText className={category === c ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'}>
                  {c}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="mb-3 flex-row items-center gap-2">
          <AppText className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Ordenar:</AppText>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Ordenar por mais recentes"
            accessibilityState={{ selected: sort === 'recent' }}
            onPress={() => setSort('recent')}
            className="min-h-[44px] justify-center"
          >
            <AppText className={sort === 'recent' ? 'text-sm font-archivo-semibold text-brand dark:text-brand-dark' : 'text-sm text-ink-secondary dark:text-ink-secondary-dark'}>
              Mais recentes
            </AppText>
          </Pressable>
          <AppText className="text-ink-secondary dark:text-ink-dark0">·</AppText>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Ordenar de A a Z"
            accessibilityState={{ selected: sort === 'name' }}
            onPress={() => setSort('name')}
            className="min-h-[44px] justify-center"
          >
            <AppText className={sort === 'name' ? 'text-sm font-archivo-semibold text-brand dark:text-brand-dark' : 'text-sm text-ink-secondary dark:text-ink-secondary-dark'}>
              A-Z
            </AppText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleRecipes}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-24"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(listEntranceDelay(index)).duration(220)}>
            <Link href={`/recipes/${type}/${item.id}`} asChild>
              <RecipeCard recipe={item} onPress={() => {}} />
            </Link>
          </Animated.View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-12 items-center px-6">
              <AppText className="mb-4 text-center text-base text-ink-secondary dark:text-ink-secondary-dark">
                Você ainda não possui nenhuma ficha técnica
              </AppText>
              {canWriteRecipes(role) ? (
                <Link href={`/recipes/${type}/new`} asChild>
                  <PrimaryButton label="Criar primeira ficha" />
                </Link>
              ) : null}
            </View>
          ) : null
        }
      />

      {visibleRecipes.length > 0 && canWriteRecipes(role) ? (
        <Link href={`/recipes/${type}/new`} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Criar nova ficha"
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-brand dark:bg-brand-dark shadow-lg active:bg-brand-pressed dark:active:bg-brand-dark"
          >
            <AppText className="text-2xl text-white">+</AppText>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
