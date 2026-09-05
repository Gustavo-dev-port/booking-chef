import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { BookOpen, ChefHat, Martini, Package, Users } from 'lucide-react-native';
import { ModuleCard } from '../../src/components/ModuleCard';
import { RecipeCard } from '../../src/components/RecipeCard';
import { listRecentRecipes, type RecipeSummary } from '../../src/features/recipes/api';
import { useAuthStore } from '../../src/features/auth/store';
import { resolveAppRole, canAccessRecipeType, canManageBusiness } from '../../src/features/team/permissions';

/**
 * Home: módulos Bar/Cozinha navegam pra lista de fichas filtrada por type;
 * "Gerar Booking" (Fase 5) abre a tela de geração do PDF.
 *
 * V2, história 08.3 — só mostra o módulo pra quem o papel permite (ver
 * src/features/team/permissions.ts). É só a camada de conveniência: quem
 * tenta acessar direto por link é bloqueado de verdade pelo guard de
 * cada tela + pela RLS no banco.
 */
export default function HomeScreen() {
  const router = useRouter();
  const companyId = useAuthStore((s) => s.membership?.company_id);
  const membership = useAuthStore((s) => s.membership);
  const role = useMemo(() => resolveAppRole(membership), [membership]);
  const [recent, setRecent] = useState<RecipeSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!companyId) return;
      listRecentRecipes(companyId, 5).then(setRecent);
    }, [companyId])
  );

  return (
    <ScrollView className="flex-1 bg-surface-page dark:bg-surface-page-dark" contentContainerClassName="p-4 pt-16">
      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="mb-1 font-display text-4xl text-ink dark:text-ink-dark">Fichas técnicas</Text>
          <Text className="text-base text-ink-secondary dark:text-ink-secondary-dark">O caderno digital de receitas do seu estabelecimento</Text>
        </View>
        <Link href="/profile" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Perfil" hitSlop={8} className="min-h-[44px] min-w-[44px] items-end justify-center">
            <Text className="text-sm font-archivo-medium text-brand dark:text-brand-dark">Perfil</Text>
          </Pressable>
        </Link>
      </View>

      <View className="flex-row gap-3">
        {canAccessRecipeType(role, 'bar') ? (
          <ModuleCard icon={Martini} title="Bar" subtitle="Drinks" onPress={() => router.push('/recipes/bar')} />
        ) : null}
        {canAccessRecipeType(role, 'cozinha') ? (
          <ModuleCard
            icon={ChefHat}
            title="Cozinha"
            subtitle="Pratos"
            onPress={() => router.push('/recipes/cozinha')}
          />
        ) : null}
      </View>

      <View className="mt-3 flex-row gap-3">
        <ModuleCard
          icon={BookOpen}
          title="Gerar Booking"
          subtitle="Booking para impressão"
          onPress={() => router.push('/booking')}
        />
        {canManageBusiness(role) ? (
          <ModuleCard icon={Package} title="Estoque" subtitle="Insumos" onPress={() => router.push('/inventory')} />
        ) : null}
      </View>

      {canManageBusiness(role) ? (
        <View className="mt-3 flex-row gap-3">
          <ModuleCard icon={Users} title="Equipe" subtitle="Convites" onPress={() => router.push('/team')} />
          <View className="flex-1" />
        </View>
      ) : null}

      <Text className="mb-3 mt-8 text-sm font-archivo-semibold text-ink-secondary dark:text-ink-secondary-dark">Últimas fichas editadas</Text>
      {recent.length === 0 ? (
        <Text className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Nenhuma ficha editada ainda</Text>
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
