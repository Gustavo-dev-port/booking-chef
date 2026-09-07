import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { BookOpen, ChefHat, Martini } from 'lucide-react-native';
import { ModuleCard } from '../../../src/components/ModuleCard';
import { RecipeCard } from '../../../src/components/RecipeCard';
import { listRecentRecipes, type RecipeSummary } from '../../../src/features/recipes/api';
import { useAuthStore } from '../../../src/features/auth/store';
import { resolveAppRole, canAccessRecipeType } from '../../../src/features/team/permissions';

/**
 * Home: módulos Bar/Cozinha navegam pra lista de fichas filtrada por type;
 * "Gerar Booking" (Fase 5) abre a tela de geração do PDF.
 *
 * Estoque, Equipe e Perfil viraram abas da barra inferior (Design System
 * v1, seção 05 — ver app/(app)/(tabs)/_layout.tsx) — saíram daqui pra não
 * duplicar caminho de navegação.
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
      <View className="mb-6">
        <Text className="mb-1 font-display text-4xl text-ink dark:text-ink-dark">Fichas técnicas</Text>
        <Text className="text-base text-ink-secondary dark:text-ink-secondary-dark">O caderno digital de receitas do seu estabelecimento</Text>
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
        <View className="flex-1" />
      </View>

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
