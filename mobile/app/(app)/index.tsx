import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { ModuleCard } from '../../src/components/ModuleCard';
import { RecipeCard } from '../../src/components/RecipeCard';
import { listRecentRecipes, type RecipeSummary } from '../../src/features/recipes/api';
import { useAuthStore } from '../../src/features/auth/store';

/**
 * Home: módulos Bar/Cozinha navegam pra lista de fichas filtrada por type;
 * "Gerar Booking" (Fase 5) abre a tela de geração do PDF.
 */
export default function HomeScreen() {
  const router = useRouter();
  const companyId = useAuthStore((s) => s.membership?.company_id);
  const [recent, setRecent] = useState<RecipeSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!companyId) return;
      listRecentRecipes(companyId, 5).then(setRecent);
    }, [companyId])
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerClassName="p-4 pt-16">
      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-50">Fichas técnicas</Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">O caderno digital de receitas do seu estabelecimento</Text>
        </View>
        <Link href="/profile" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Perfil" hitSlop={8} className="min-h-[44px] min-w-[44px] items-end justify-center">
            <Text className="text-sm font-medium text-blue-600">Perfil</Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex-row gap-3">
        <ModuleCard icon="🍸" title="Bar" subtitle="Drinks" onPress={() => router.push('/recipes/bar')} />
        <ModuleCard
          icon="👨‍🍳"
          title="Cozinha"
          subtitle="Pratos"
          onPress={() => router.push('/recipes/cozinha')}
        />
      </View>

      <View className="mt-3 flex-row gap-3">
        <ModuleCard
          icon="📖"
          title="Gerar Booking"
          subtitle="Booking para impressão"
          onPress={() => router.push('/booking')}
        />
        <ModuleCard icon="📦" title="Estoque" subtitle="Insumos" onPress={() => router.push('/inventory')} />
      </View>

      <Text className="mb-3 mt-8 text-sm font-semibold text-gray-500 dark:text-gray-400">Últimas fichas editadas</Text>
      {recent.length === 0 ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400">Nenhuma ficha editada ainda</Text>
      ) : (
        recent.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.type}/${recipe.id}`} asChild>
            <RecipeCard recipe={recipe} onPress={() => {}} />
          </Link>
        ))
      )}
    </ScrollView>
  );
}
