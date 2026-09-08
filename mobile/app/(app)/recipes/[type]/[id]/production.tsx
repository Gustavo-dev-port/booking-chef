import { useCallback, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText } from '../../../../../src/components/AppText';
import { BackButton } from '../../../../../src/components/BackButton';
import { FormField } from '../../../../../src/components/FormField';
import { KeyboardAvoidingScreen } from '../../../../../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../../../../../src/components/PrimaryButton';
import { productionSchema, type ProductionFormValues, type ProductionInput } from '../../../../../src/validators/production';
import { getRecipe, type RecipeDetail } from '../../../../../src/features/recipes/api';
import { listInventoryItems } from '../../../../../src/features/inventory/api';
import { listProductions, registerProduction, type Production } from '../../../../../src/features/production/api';
import { computeConsumptionPreview, hasInsufficientStock } from '../../../../../src/features/production/consumption';
import { ingredientUnitLabel, isRecipeType } from '../../../../../src/validators/recipe';
import { useAuthStore } from '../../../../../src/features/auth/store';
import { canAccessRecipeType, canWriteRecipes, resolveAppRole } from '../../../../../src/features/team/permissions';
import { useRoleGuard } from '../../../../../src/hooks/useRoleGuard';
import { listEntranceDelay } from '../../../../../src/features/ui/listEntrance';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const EMPTY_VALUES: ProductionFormValues = { quantityProduced: '' as unknown as number, notes: '' };

/**
 * Registrar produção (V3, Épico 09) + histórico, numa tela só — mesmo
 * padrão de app/(app)/inventory/[id]/movements.tsx: uma ficha só, faz
 * sentido gerenciar os dois juntos. A baixa de estoque em si roda inteira
 * no banco (register_production(), atômica e tudo-ou-nada) — a prévia
 * abaixo é só uma conveniência de UX (história 09.3), não é o que decide
 * se a produção vai ser aceita ou não.
 */
export default function RecipeProductionScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const rawType = params.type ?? '';
  const type = isRecipeType(rawType) ? rawType : 'bar';
  const membership = useAuthStore((s) => s.membership);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const companyId = membership?.company_id;
  const role = useMemo(() => resolveAppRole(membership), [membership]);
  // Mesmo par usado pra liberar "Salvar ficha" no editor — registrar
  // produção também é uma escrita no módulo (bar/cozinha) do papel.
  useRoleGuard(canAccessRecipeType(role, type) && canWriteRecipes(role));

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [currentQuantityById, setCurrentQuantityById] = useState<Map<string, number>>(new Map());
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ProductionFormValues, unknown, ProductionInput>({
    resolver: zodResolver(productionSchema),
    defaultValues: EMPTY_VALUES,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recipeResult, productionsResult] = await Promise.all([getRecipe(params.id), listProductions(params.id)]);
      setRecipe(recipeResult);
      setProductions(productionsResult);
      if (companyId) {
        const items = await listInventoryItems(companyId);
        setCurrentQuantityById(new Map(items.map((item) => [item.id, item.current_quantity])));
      }
    } finally {
      setLoading(false);
    }
  }, [params.id, companyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const watchedQuantity = useWatch({ control, name: 'quantityProduced' });
  const preview = useMemo(
    () =>
      recipe
        ? computeConsumptionPreview(recipe.ingredients, Number(watchedQuantity) || 0, currentQuantityById)
        : [],
    [recipe, watchedQuantity, currentQuantityById]
  );
  const previewHasInsufficientStock = hasInsufficientStock(preview);

  const onSubmit = async (data: ProductionInput) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await registerProduction(params.id, data.quantityProduced, data.notes || undefined);
      reset(EMPTY_VALUES);
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível registrar a produção.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasStockLinkedIngredients = (recipe?.ingredients ?? []).some((i) => !!i.ingredient_id);

  return (
    <View className="flex-1 bg-surface-page dark:bg-surface-page-dark pt-16">
      <View className="px-4">
        <BackButton />
        <AppText className="mb-1 text-2xl font-archivo-bold text-ink dark:text-ink-dark">
          {recipe?.name ?? 'Produção'}
        </AppText>
        <AppText className="mb-4 text-base text-ink-secondary dark:text-ink-secondary-dark">
          Registrar o que foi produzido baixa automaticamente o estoque dos insumos vinculados a esta ficha.
        </AppText>

        {!loading && !hasStockLinkedIngredients ? (
          <View className="mb-4 rounded-xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3">
            <AppText className="text-sm text-ink-secondary dark:text-ink-secondary-dark">
              Nenhum ingrediente desta ficha está vinculado ao estoque — a produção pode ser registrada para o
              histórico, mas nenhum saldo será baixado.
            </AppText>
          </View>
        ) : null}

        <FormField
          control={control}
          name="quantityProduced"
          label="Quantidade produzida"
          keyboardType="decimal-pad"
        />
        <FormField control={control} name="notes" label="Observações (opcional)" />

        {preview.length > 0 ? (
          <View className="mb-3 rounded-xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3">
            <AppText className="mb-2 text-sm font-archivo-semibold text-ink dark:text-ink-dark">Vai consumir</AppText>
            {preview.map((row) => (
              <View key={row.ingredientId} className="mb-1 flex-row items-center justify-between">
                <AppText className="text-sm text-ink dark:text-ink-dark">{row.ingredientName}</AppText>
                <AppText
                  className={
                    'text-sm ' +
                    (row.insufficient
                      ? 'font-archivo-semibold text-danger dark:text-danger-dark'
                      : 'text-ink-secondary dark:text-ink-secondary-dark')
                  }
                >
                  {row.required.toFixed(2)} {ingredientUnitLabel(row.unit)}
                  {row.insufficient ? ` · saldo: ${row.available.toFixed(2)}` : ''}
                </AppText>
              </View>
            ))}
            {previewHasInsufficientStock ? (
              <AppText className="mt-1 text-xs text-danger dark:text-danger-dark">
                Saldo insuficiente para pelo menos um insumo — a produção não vai ser aceita com essa quantidade.
              </AppText>
            ) : null}
          </View>
        ) : null}

        {formError ? <AppText className="mb-3 text-sm text-danger dark:text-danger-dark">{formError}</AppText> : null}

        <View className="mb-6">
          <PrimaryButton label="Registrar produção" onPress={handleSubmit(onSubmit)} loading={submitting} />
        </View>

        <AppText className="mb-3 text-base font-archivo-semibold text-ink dark:text-ink-dark">Histórico</AppText>
      </View>

      <FlatList
        data={productions}
        keyExtractor={(production) => production.id}
        contentContainerClassName="px-4 pb-12"
        renderItem={({ item: production, index }) => (
          <Animated.View
            entering={FadeInDown.delay(listEntranceDelay(index)).duration(220)}
            className="mb-2 rounded-xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3"
          >
            <View className="flex-row items-center justify-between">
              <AppText className="text-base font-archivo-semibold text-ink dark:text-ink-dark">
                {production.quantity_produced} produzido(s)
              </AppText>
              <AppText className="text-xs text-ink-secondary dark:text-ink-secondary-dark">
                {formatDateTime(production.produced_at)}
              </AppText>
            </View>
            {production.notes ? (
              <AppText className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondary-dark">{production.notes}</AppText>
            ) : null}
            <AppText className="mt-1 text-xs text-ink-secondary dark:text-ink-secondary-dark">
              {production.produced_by === session?.user.id ? profile?.name || 'Você' : 'Outro usuário'}
            </AppText>
          </Animated.View>
        )}
        ListEmptyComponent={
          !loading ? (
            <AppText className="mt-4 text-center text-base text-ink-secondary dark:text-ink-secondary-dark">
              Nenhuma produção registrada ainda.
            </AppText>
          ) : null
        }
      />
    </View>
  );
}
