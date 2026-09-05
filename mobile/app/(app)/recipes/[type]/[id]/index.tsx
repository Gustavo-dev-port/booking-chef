import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '../../../../../src/components/BackButton';
import { FormField } from '../../../../../src/components/FormField';
import { IngredientCatalogPicker } from '../../../../../src/components/IngredientCatalogPicker';
import { KeyboardAvoidingScreen } from '../../../../../src/components/KeyboardAvoidingScreen';
import { PrimaryButton } from '../../../../../src/components/PrimaryButton';
import { UnitPicker } from '../../../../../src/components/UnitPicker';
import {
  recipeSchema,
  isRecipeType,
  ingredientUnitLabel,
  type RecipeInput,
  type RecipeFormValues,
} from '../../../../../src/validators/recipe';
import {
  archiveRecipe,
  createRecipe,
  getRecipe,
  setRecipePhoto,
  updateRecipe,
} from '../../../../../src/features/recipes/api';
import { calculateCmv } from '../../../../../src/features/recipes/cmv';
import { saveCostSnapshot } from '../../../../../src/features/recipes/costSnapshot';
import { suggestPrices } from '../../../../../src/features/recipes/pricing';
import { pickPhoto, uploadRecipePhoto, type PickedPhoto } from '../../../../../src/features/recipes/photos';
import { listCategories, listInventoryItems, type InventoryItem, type NamedOption } from '../../../../../src/features/inventory/api';
import { useRecipePhotoUrl } from '../../../../../src/hooks/useRecipePhotoUrl';
import { useAuthStore } from '../../../../../src/features/auth/store';
import { canAccessRecipeType, canSeeFinancials, canWriteRecipes, resolveAppRole } from '../../../../../src/features/team/permissions';
import { useRoleGuard } from '../../../../../src/hooks/useRoleGuard';

const EMPTY_VALUES: RecipeFormValues = {
  name: '',
  category: '',
  yieldAmount: '',
  glassType: '',
  garnish: '',
  finalWeight: '',
  instructions: '',
  notes: '',
  ingredients: [],
  salePrice: '',
};

/**
 * Editor de ficha técnica — cria (id === "new") ou edita. Campos
 * condicionais: copo/decoração só aparecem pra Bar, peso final só pra
 * Cozinha (ver FASE1-ARQUITETURA-MOBILE.md, seção 5). Ordem dos campos
 * pedida pelo usuário: nome e ingredientes primeiro, foto por último.
 *
 * V2, Épico 07 (07.1 + 07.2): cada linha de ingrediente pode ser
 * vinculada a um insumo do estoque (botão "🔗 Estoque") — nome/unidade
 * vêm travados do insumo, e a linha entra no cálculo de custo/CMV ao
 * vivo. Texto livre continua funcionando normalmente como alternativa
 * (11_BACKLOG.md, história 07.1).
 */
export default function RecipeEditorScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const rawType = params.type ?? '';
  const type = isRecipeType(rawType) ? rawType : 'bar';
  const isNew = params.id === 'new';
  const membership = useAuthStore((s) => s.membership);
  const companyId = membership?.company_id;
  const role = useMemo(() => resolveAppRole(membership), [membership]);
  useRoleGuard(canAccessRecipeType(role, type));
  const canWrite = canWriteRecipes(role);
  const canSeePricing = canSeeFinancials(role);

  const [loading, setLoading] = useState(!isNew);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(null);
  const [pickedPhoto, setPickedPhoto] = useState<PickedPhoto | null>(null);
  const [catalogItems, setCatalogItems] = useState<InventoryItem[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<NamedOption[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<RecipeFormValues, unknown, RecipeInput>({
    resolver: zodResolver(recipeSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });

  useEffect(() => {
    if (!companyId) return;
    Promise.all([listInventoryItems(companyId), listCategories(companyId)]).then(([items, categories]) => {
      setCatalogItems(items);
      setCatalogCategories(categories);
    });
  }, [companyId]);

  const categoryNameById = useMemo(
    () => new Map(catalogCategories.map((c) => [c.id, c.name])),
    [catalogCategories]
  );

  useEffect(() => {
    if (isNew) return;
    getRecipe(params.id).then((recipe) => {
      if (!recipe) {
        setFormError('Ficha não encontrada.');
        setLoading(false);
        return;
      }
      setExistingPhotoPath(recipe.photo_path);
      reset({
        name: recipe.name,
        category: recipe.category ?? '',
        yieldAmount: recipe.yield_amount ?? '',
        glassType: recipe.glass_type ?? '',
        garnish: recipe.garnish ?? '',
        finalWeight: recipe.final_weight ?? '',
        instructions: recipe.instructions ?? '',
        notes: recipe.notes ?? '',
        salePrice: recipe.sale_price || '',
        ingredients: recipe.ingredients.map((i) => ({
          ingredientName: i.ingredient_name,
          quantity: i.quantity,
          // Ficha antiga pode ter unidade em texto livre (Fase 4); só as 5
          // opções fechadas (Fase 8.1) são aceitas daqui pra frente — se o
          // valor salvo não bater com nenhuma, o campo abre sem seleção.
          unit: i.unit as RecipeFormValues['ingredients'][number]['unit'],
          ingredientId: i.ingredient_id ?? '',
        })),
      });
      setLoading(false);
    });
  }, [isNew, params.id, reset]);

  const photoPreviewUrl = useRecipePhotoUrl(pickedPhoto ? null : existingPhotoPath);
  const displayedPhotoUri = pickedPhoto?.uri ?? photoPreviewUrl;

  const handlePickPhoto = async () => {
    const photo = await pickPhoto();
    if (photo) setPickedPhoto(photo);
  };

  // Custo/CMV ao vivo (07.2) — recalcula a cada tecla, sem precisar salvar.
  const watchedIngredients = useWatch({ control, name: 'ingredients' });
  const watchedSalePrice = useWatch({ control, name: 'salePrice' });
  const costById = useMemo(
    () => new Map(catalogItems.map((item) => [item.id, item.unit_cost ?? 0])),
    [catalogItems]
  );
  const cmv = useMemo(
    () =>
      calculateCmv(
        (watchedIngredients ?? []).map((row) => ({
          ingredientId: row?.ingredientId || undefined,
          quantity: Number(row?.quantity) || 0,
        })),
        costById,
        Number(watchedSalePrice) || undefined
      ),
    [watchedIngredients, watchedSalePrice, costById]
  );

  // Calculadora de preço sugerido (07.4) — usa o custo total já calculado
  // acima; "Usar este preço" preenche salePrice mediante confirmação
  // explícita (o próprio toque no botão), nunca sozinho.
  const [desiredCmv, setDesiredCmv] = useState('30');
  const suggested = useMemo(
    () => suggestPrices(cmv.totalCost, Number(desiredCmv.replace(',', '.')) || 0),
    [cmv.totalCost, desiredCmv]
  );

  const onSubmit = async (data: RecipeInput) => {
    if (!companyId) return;
    setFormError(null);
    try {
      const id = isNew ? await createRecipe(companyId, type, data) : params.id;
      if (!isNew) await updateRecipe(companyId, id, data);

      if (pickedPhoto) {
        const path = await uploadRecipePhoto(companyId, id, pickedPhoto);
        await setRecipePhoto(id, path);
      }

      // 07.3 — snapshot de custo a cada salvamento; best-effort, nunca
      // trava o salvamento da ficha (ver costSnapshot.ts).
      await saveCostSnapshot(id, cmv, data.salePrice);

      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a ficha.');
    }
  };

  const handleArchive = () => {
    if (isNew) return;
    Alert.alert('Arquivar ficha', 'Essa ficha some da lista, mas fica preservada no histórico. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Arquivar',
        style: 'destructive',
        onPress: async () => {
          await archiveRecipe(params.id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-base text-gray-500 dark:text-gray-400">Carregando…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-white dark:bg-gray-900" contentContainerClassName="px-6 py-16">
      <BackButton />
      <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">
        {isNew ? 'Nova ficha' : 'Editar ficha'}
      </Text>

      <FormField control={control} name="name" label="Nome" />

      <Text className="mb-3 mt-2 text-base font-semibold text-gray-900 dark:text-gray-50">Ingredientes</Text>
      {fields.map((field, index) => {
        const rowIngredientId = watchedIngredients?.[index]?.ingredientId;
        const linkedItem = rowIngredientId ? catalogItems.find((c) => c.id === rowIngredientId) : undefined;

        return (
          <View key={field.id} className="mb-2 gap-2 rounded-xl border border-gray-100 dark:border-gray-800 p-2">
            {linkedItem ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-medium text-gray-900 dark:text-gray-50" numberOfLines={1}>
                    {linkedItem.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    R$ {(linkedItem.unit_cost ?? 0).toFixed(2)}/{ingredientUnitLabel(linkedItem.usage_unit)}
                    {linkedItem.category_id && categoryNameById.get(linkedItem.category_id)
                      ? ` · ${categoryNameById.get(linkedItem.category_id)}`
                      : ' · do estoque'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Desvincular do estoque"
                  onPress={() => setValue(`ingredients.${index}.ingredientId`, '')}
                  className="h-11 w-11 items-center justify-center"
                >
                  <Text className="text-lg text-gray-500 dark:text-gray-400">✕</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-row items-end gap-2">
                <View className="flex-1">
                  <FormField control={control} name={`ingredients.${index}.ingredientName`} label="Ingrediente" />
                </View>
                <View className="mb-4">
                  <IngredientCatalogPicker
                    items={catalogItems}
                    onSelect={(item) => {
                      setValue(`ingredients.${index}.ingredientId`, item.id);
                      setValue(`ingredients.${index}.ingredientName`, item.name);
                      setValue(
                        `ingredients.${index}.unit`,
                        item.usage_unit as RecipeFormValues['ingredients'][number]['unit']
                      );
                    }}
                  />
                </View>
              </View>
            )}

            <View className="flex-row items-start gap-2">
              <View className="flex-1">
                <FormField
                  control={control}
                  name={`ingredients.${index}.quantity`}
                  label="Qtd."
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                {linkedItem ? (
                  <View>
                    <Text className="mb-1 text-base text-gray-700 dark:text-gray-300">Un.</Text>
                    <View className="min-h-[44px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 px-3">
                      <Text className="text-base text-gray-500 dark:text-gray-400">
                        {ingredientUnitLabel(linkedItem.usage_unit)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <UnitPicker control={control} name={`ingredients.${index}.unit`} label="Un." />
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remover ingrediente"
                onPress={() => remove(index)}
                disabled={!canWrite}
                className={'mt-9 h-11 w-11 items-center justify-center' + (canWrite ? '' : ' opacity-0')}
              >
                <Text className="text-lg text-red-600">✕</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {canWrite ? (
        <View className="mb-4">
          <PrimaryButton
            label="+ Adicionar ingrediente"
            variant="outline"
            onPress={() => append({ ingredientName: '', quantity: 0, unit: 'un', ingredientId: '' })}
          />
        </View>
      ) : null}

      {/* Custo/CMV/preço sugerido são dado financeiro (V2, história 08.3)
          — só proprietario/gerente veem essa seção inteira; bartender/
          cozinheiro/visualizador nem chegam a saber o custo do que
          editam. Reforça na interface o que a RLS de ingredients já
          bloqueia de verdade (listInventoryItems volta vazio pra eles). */}
      {canSeePricing ? (
        <>
      <FormField
        control={control}
        name="salePrice"
        label="Preço de venda (opcional)"
        keyboardType="decimal-pad"
      />

      <View className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-3">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Custo total</Text>
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
            R$ {cmv.totalCost.toFixed(2)}
          </Text>
        </View>
        {cmv.cmvPercentage !== null ? (
          <>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-sm text-gray-500 dark:text-gray-400">CMV</Text>
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {cmv.cmvPercentage.toFixed(1)}%
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Margem bruta</Text>
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-50">
                R$ {(cmv.grossMargin ?? 0).toFixed(2)}
              </Text>
            </View>
          </>
        ) : (
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Informe o preço de venda pra ver o CMV%.
          </Text>
        )}
        {cmv.hasUnknownCost ? (
          <Text className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Algum ingrediente ainda não está vinculado ao estoque — o custo total pode estar incompleto.
          </Text>
        ) : null}
        {!isNew ? (
          <Link href={`/recipes/${type}/${params.id}/cost-history`} asChild>
            <Pressable accessibilityRole="button" className="mt-2 min-h-[32px] justify-center">
              <Text className="text-sm font-medium text-blue-600">Ver histórico de custo</Text>
            </Pressable>
          </Link>
        ) : null}
      </View>

      {cmv.totalCost > 0 ? (
        <View className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-50">
            Calculadora de preço sugerido
          </Text>
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-sm text-gray-700 dark:text-gray-300">CMV desejado (%)</Text>
            <TextInput
              accessibilityLabel="CMV desejado"
              keyboardType="decimal-pad"
              value={desiredCmv}
              onChangeText={setDesiredCmv}
              className="min-h-[36px] w-16 rounded-lg border border-gray-300 dark:border-gray-700 px-2 text-center text-base text-gray-900 dark:text-gray-50"
            />
          </View>

          <View className="flex-row gap-2">
            {(
              [
                { key: 'minimum', label: 'Mínimo', value: suggested.minimum },
                { key: 'ideal', label: 'Ideal', value: suggested.ideal },
                { key: 'premium', label: 'Premium', value: suggested.premium },
              ] as const
            ).map((tier) => (
              <View key={tier.key} className="flex-1 items-center rounded-xl border border-gray-200 dark:border-gray-800 p-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">{tier.label}</Text>
                <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-50">
                  R$ {tier.value.toFixed(2)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Usar preço ${tier.label}`}
                  onPress={() => setValue('salePrice', tier.value)}
                  className="min-h-[32px] items-center justify-center rounded-lg bg-blue-600 px-2"
                >
                  <Text className="text-xs font-semibold text-white">Usar este preço</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}
        </>
      ) : null}

      <FormField control={control} name="category" label="Categoria (opcional)" />
      <FormField control={control} name="yieldAmount" label="Rendimento" placeholder="Ex.: 1 dose, 4 porções" />

      {type === 'bar' ? (
        <>
          <FormField control={control} name="glassType" label="Copo utilizado" />
          <FormField control={control} name="garnish" label="Decoração" />
        </>
      ) : (
        <FormField control={control} name="finalWeight" label="Peso final" />
      )}

      <FormField
        control={control}
        name="instructions"
        label="Modo de preparo"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="min-h-[100px] rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-3 text-base text-gray-900 dark:text-gray-50"
      />
      <FormField
        control={control}
        name="notes"
        label="Observações (opcional)"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="min-h-[80px] rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-3 text-base text-gray-900 dark:text-gray-50"
      />

      <Text className="mb-3 mt-2 text-base font-semibold text-gray-900 dark:text-gray-50">Foto (opcional)</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escolher foto"
        onPress={handlePickPhoto}
        className="mb-4 h-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950"
      >
        {displayedPhotoUri ? (
          <Image source={{ uri: displayedPhotoUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Text className="text-sm text-gray-500 dark:text-gray-400">Toque para adicionar uma foto</Text>
        )}
      </Pressable>

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      {canWrite ? (
        <>
          <View className="mb-3">
            <PrimaryButton label="Salvar ficha" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
          </View>
          {!isNew ? <PrimaryButton label="Arquivar ficha" variant="outline" onPress={handleArchive} /> : null}
        </>
      ) : null}
    </KeyboardAvoidingScreen>
  );
}
