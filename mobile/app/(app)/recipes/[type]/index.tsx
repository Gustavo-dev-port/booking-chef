import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../../../src/components/BackButton';
import { RecipeCard } from '../../../../src/components/RecipeCard';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { listRecipes, type RecipeSummary } from '../../../../src/features/recipes/api';
import { useAuthStore } from '../../../../src/features/auth/store';
import { canAccessRecipeType, canWriteRecipes, resolveAppRole } from '../../../../src/features/team/permissions';
import { useRoleGuard } from '../../../../src/hooks/useRoleGuard';
import { isRecipeType, RECIPE_TYPE_LABELS } from '../../../../src/validators/recipe';

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
    <View className="flex-1 bg-gray-50 dark:bg-gray-950 pt-16">
      <View className="px-4">
        <BackButton />
        <Text className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">{RECIPE_TYPE_LABELS[type]}</Text>

        <TextInput
          accessibilityLabel="Buscar por nome"
          placeholder="Buscar por nome"
          value={search}
          onChangeText={setSearch}
          className="mb-3 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-base"
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
                (category === null ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900')
              }
            >
              <Text className={category === null ? 'text-sm font-semibold text-white' : 'text-sm text-gray-700 dark:text-gray-300'}>
                Todas
              </Text>
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
                  (category === c ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900')
                }
              >
                <Text className={category === c ? 'text-sm font-semibold text-white' : 'text-sm text-gray-700 dark:text-gray-300'}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="mb-3 flex-row items-center gap-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Ordenar:</Text>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Ordenar por mais recentes"
            accessibilityState={{ selected: sort === 'recent' }}
            onPress={() => setSort('recent')}
            className="min-h-[44px] justify-center"
          >
            <Text className={sort === 'recent' ? 'text-sm font-semibold text-blue-600' : 'text-sm text-gray-500 dark:text-gray-400'}>
              Mais recentes
            </Text>
          </Pressable>
          <Text className="text-gray-400 dark:text-gray-500">·</Text>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Ordenar de A a Z"
            accessibilityState={{ selected: sort === 'name' }}
            onPress={() => setSort('name')}
            className="min-h-[44px] justify-center"
          >
            <Text className={sort === 'name' ? 'text-sm font-semibold text-blue-600' : 'text-sm text-gray-500 dark:text-gray-400'}>
              A-Z
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visibleRecipes}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pb-24"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <Link href={`/recipes/${type}/${item.id}`} asChild>
            <RecipeCard recipe={item} onPress={() => {}} />
          </Link>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-12 items-center px-6">
              <Text className="mb-4 text-center text-base text-gray-500 dark:text-gray-400">
                Você ainda não possui nenhuma ficha técnica
              </Text>
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
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg active:bg-blue-700"
          >
            <Text className="text-2xl text-white">+</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
