import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText } from '../../../../../src/components/AppText';
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
import { calculateCmv, computeCmvStatus, cmvStatusLabel, CMV_STATUS_CLASSES } from '../../../../../src/features/recipes/cmv';
import { saveCostSnapshot } from '../../../../../src/features/recipes/costSnapshot';
import { suggestPrices } from '../../../../../src/features/recipes/pricing';
import { pickPhoto, removeRecipePhoto, takePhoto, uploadRecipePhoto, type PickedPhoto } from '../../../../../src/features/recipes/photos';
import { listCategories, listInventoryItems, type InventoryItem, type NamedOption } from '../../../../../src/features/inventory/api';
import { useRecipePhotoUrl } from '../../../../../src/hooks/useRecipePhotoUrl';
import { useAuthStore } from '../../../../../src/features/auth/store';
import { canAccessRecipeType, canSeeFinancials, canWriteRecipes, resolveAppRole } from '../../../../../src/features/team/permissions';
import { useRoleGuard } from '../../../../../src/hooks/useRoleGuard';
import { useConfirmDiscardChanges } from '../../../../../src/hooks/useConfirmDiscardChanges';

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
    getValues,
    formState: { isSubmitting, isDirty },
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

  const handlePickPhoto = () => {
    Alert.alert('Foto da ficha', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Tirar foto',
        onPress: async () => {
          const photo = await takePhoto();
          if (photo) setPickedPhoto(photo);
        },
      },
      {
        text: 'Escolher da galeria',
        onPress: async () => {
          const photo = await pickPhoto();
          if (photo) setPickedPhoto(photo);
        },
      },
    ]);
  };

  const handleRemovePhoto = () => {
    Alert.alert('Remover foto', 'A foto vai ser removida da ficha. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          if (pickedPhoto) {
            // Ainda nem foi salva — só limpa o estado local.
            setPickedPhoto(null);
            return;
          }
          if (existingPhotoPath && !isNew) {
            try {
              await removeRecipePhoto(params.id);
              setExistingPhotoPath(null);
            } catch (error) {
              Alert.alert('Não foi possível remover', error instanceof Error ? error.message : 'Tente novamente.');
            }
          }
        },
      },
    ]);
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
  // Hospeda o resultado em vez de chamar computeCmvStatus() 3x no JSX
  // abaixo (mesmo valor, |cmv.cmvPercentage| não muda entre as chamadas).
  const cmvStatus = computeCmvStatus(cmv.cmvPercentage ?? 0);

  // Microinteração (Design System v1, seção 07) — a barra de CMV anima a
  // largura em vez de saltar direto pro valor novo a cada tecla digitada.
  const cmvBarPercent = cmv.cmvPercentage !== null ? Math.min(100, (cmv.cmvPercentage / 60) * 100) : 0;
  const cmvBarWidth = useSharedValue(cmvBarPercent);
  useEffect(() => {
    cmvBarWidth.value = withTiming(cmvBarPercent, { duration: 300 });
  }, [cmvBarPercent, cmvBarWidth]);
  const cmvBarStyle = useAnimatedStyle(() => ({ width: `${cmvBarWidth.value}%` }));

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

      // Zera isDirty (mantendo os valores exibidos) antes de voltar, pra
      // esse mesmo router.back() não reabrir o aviso de "sair sem
      // salvar" — ver useConfirmDiscardChanges.
      reset(getValues());
      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar a ficha.');
    }
  };

  // pickedPhoto é state à parte (não é campo do react-hook-form) — conta
  // como mudança não salva também, senão trocar só a foto e sair não
  // dispararia o aviso.
  useConfirmDiscardChanges(isDirty || !!pickedPhoto, handleSubmit(onSubmit));

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
      <View className="flex-1 items-center justify-center bg-surface-card dark:bg-surface-card-dark">
        <AppText className="text-base text-ink-secondary dark:text-ink-secondary-dark">Carregando…</AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingScreen className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="px-6 py-16">
      <BackButton />
      <AppText className="mb-6 text-2xl font-archivo-bold text-ink dark:text-ink-dark">
        {isNew ? 'Nova ficha' : 'Editar ficha'}
      </AppText>

      <FormField control={control} name="name" label="Nome" />

      <AppText className="mb-3 mt-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Ingredientes</AppText>
      {fields.map((field, index) => {
        const rowIngredientId = watchedIngredients?.[index]?.ingredientId;
        const linkedItem = rowIngredientId ? catalogItems.find((c) => c.id === rowIngredientId) : undefined;

        return (
          <View key={field.id} className="mb-2 gap-2 rounded-xl border border-surface-border dark:border-surface-border-dark p-2">
            {linkedItem ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <AppText className="text-base font-archivo-medium text-ink dark:text-ink-dark" numberOfLines={1}>
                    {linkedItem.name}
                  </AppText>
                  <AppText className="text-xs text-ink-secondary dark:text-ink-secondary-dark">
                    R$ {(linkedItem.unit_cost ?? 0).toFixed(2)}/{ingredientUnitLabel(linkedItem.usage_unit)}
                    {linkedItem.category_id && categoryNameById.get(linkedItem.category_id)
                      ? ` · ${categoryNameById.get(linkedItem.category_id)}`
                      : ' · do estoque'}
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Desvincular do estoque"
                  onPress={() => setValue(`ingredients.${index}.ingredientId`, '')}
                  className="h-11 w-11 items-center justify-center"
                >
                  <AppText className="text-lg text-ink-secondary dark:text-ink-secondary-dark">✕</AppText>
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
                    <AppText className="mb-1 text-base text-ink dark:text-ink-dark">Un.</AppText>
                    <View className="min-h-[44px] items-center justify-center rounded-xl border border-surface-border dark:border-surface-border-dark px-3">
                      <AppText className="text-base text-ink-secondary dark:text-ink-secondary-dark">
                        {ingredientUnitLabel(linkedItem.usage_unit)}
                      </AppText>
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
                <AppText className="text-lg text-danger dark:text-danger-dark">✕</AppText>
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

      <View className="mb-4 rounded-xl border border-surface-border dark:border-surface-border-dark bg-surface-page dark:bg-surface-page-dark p-3">
        <View className="flex-row justify-between">
          <AppText className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Custo total</AppText>
          <AppText className="font-archivo-semibold text-base text-ink dark:text-ink-dark">
            R$ {cmv.totalCost.toFixed(2)}
          </AppText>
        </View>
        {cmv.cmvPercentage !== null ? (
          <>
            {/* Indicador de CMV (Design System v1, "05 · Componentes") — o
                número-herói vai em serifado grande: "é o dado que faz o
                dono abrir o app". Meta fixa em 30% (ver cmv.ts,
                computeCmvStatus) — o app ainda não tem meta configurável
                por empresa. */}
            <View className="mt-3">
              <View className="flex-row items-baseline justify-between">
                <AppText className={`font-display text-3xl ${CMV_STATUS_CLASSES[cmvStatus].text}`}>
                  {cmv.cmvPercentage.toFixed(1)}%
                </AppText>
                <AppText className={`font-archivo-bold text-xs ${CMV_STATUS_CLASSES[cmvStatus].text}`}>
                  {cmvStatusLabel(cmvStatus, cmv.cmvPercentage)}
                </AppText>
              </View>
              <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-alt dark:bg-surface-border-dark">
                <Animated.View className={`h-1.5 rounded-full ${CMV_STATUS_CLASSES[cmvStatus].bar}`} style={cmvBarStyle} />
              </View>
            </View>
            <View className="mt-3 flex-row justify-between">
              <AppText className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Margem bruta</AppText>
              <AppText className="font-archivo-semibold text-base text-ink dark:text-ink-dark">
                R$ {(cmv.grossMargin ?? 0).toFixed(2)}
              </AppText>
            </View>
          </>
        ) : (
          <AppText className="mt-1 text-xs text-ink-secondary dark:text-ink-secondary-dark">
            Informe o preço de venda pra ver o CMV%.
          </AppText>
        )}
        {cmv.hasUnknownCost ? (
          <AppText className="mt-1 text-xs text-warning dark:text-warning-dark">
            Algum ingrediente ainda não está vinculado ao estoque — o custo total pode estar incompleto.
          </AppText>
        ) : null}
        {!isNew ? (
          <Link href={`/recipes/${type}/${params.id}/cost-history`} asChild>
            <Pressable accessibilityRole="button" className="mt-2 min-h-[32px] justify-center">
              <AppText className="text-sm font-archivo-medium text-brand dark:text-brand-dark">Ver histórico de custo</AppText>
            </Pressable>
          </Link>
        ) : null}
      </View>

      {cmv.totalCost > 0 ? (
        <View className="mb-4 rounded-xl border border-surface-border dark:border-surface-border-dark p-3">
          <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">
            Calculadora de preço sugerido
          </AppText>
          <View className="mb-3 flex-row items-center gap-2">
            <AppText className="text-sm text-ink dark:text-ink-dark">CMV desejado (%)</AppText>
            <TextInput
              accessibilityLabel="CMV desejado"
              keyboardType="decimal-pad"
              value={desiredCmv}
              onChangeText={setDesiredCmv}
              className="min-h-[36px] w-16 rounded-lg border border-surface-input-border dark:border-surface-border-dark px-2 text-center text-base text-ink dark:text-ink-dark"
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
              <View key={tier.key} className="flex-1 items-center rounded-xl border border-surface-border dark:border-surface-border-dark p-2">
                <AppText className="text-xs text-ink-secondary dark:text-ink-secondary-dark">{tier.label}</AppText>
                <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">
                  R$ {tier.value.toFixed(2)}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Usar preço ${tier.label}`}
                  onPress={() => setValue('salePrice', tier.value)}
                  className="min-h-[32px] items-center justify-center rounded-lg bg-brand dark:bg-brand-dark px-2"
                >
                  <AppText className="text-xs font-archivo-semibold text-white">Usar este preço</AppText>
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
        className="min-h-[100px] rounded-xl border border-surface-input-border dark:border-surface-border-dark px-4 py-3 text-base text-ink dark:text-ink-dark"
      />
      <FormField
        control={control}
        name="notes"
        label="Observações (opcional)"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="min-h-[80px] rounded-xl border border-surface-input-border dark:border-surface-border-dark px-4 py-3 text-base text-ink dark:text-ink-dark"
      />

      <AppText className="mb-3 mt-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Foto (opcional)</AppText>
      <View className="relative mb-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher foto"
          onPress={handlePickPhoto}
          className="h-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-surface-input-border dark:border-surface-border-dark bg-surface-page dark:bg-surface-page-dark"
        >
          {displayedPhotoUri ? (
            <Image source={{ uri: displayedPhotoUri }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <AppText className="text-sm text-ink-secondary dark:text-ink-secondary-dark">Toque para tirar ou escolher uma foto</AppText>
          )}
        </Pressable>
        {displayedPhotoUri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remover foto"
            onPress={handleRemovePhoto}
            className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full bg-black/60"
          >
            <AppText className="text-base text-white">✕</AppText>
          </Pressable>
        ) : null}
      </View>

      {formError ? <AppText className="mb-4 text-sm text-danger dark:text-danger-dark">{formError}</AppText> : null}

      {canWrite ? (
        <>
          <View className="mb-3">
            <PrimaryButton label="Salvar ficha" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
          </View>
          {/* V3, Épico 09 — registrar o que foi produzido baixa o estoque
              dos insumos vinculados. Só depois de salva (precisa de um id
              real), mesmo critério de "Ver histórico de custo" acima. Link
              asChild + Pressable direto (não PrimaryButton) — mesmo padrão
              já usado pra navegação nesta tela. */}
          {!isNew ? (
            <Link href={`/recipes/${type}/${params.id}/production`} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Registrar produção"
                className="mb-3 min-h-[44px] items-center justify-center rounded-xl border-[1.5px] border-brand dark:border-brand-dark px-6 py-3"
              >
                <AppText className="font-archivo-semibold text-base text-brand dark:text-brand-dark">
                  Registrar produção
                </AppText>
              </Pressable>
            </Link>
          ) : null}
          {!isNew ? <PrimaryButton label="Arquivar ficha" variant="outline" onPress={handleArchive} /> : null}
        </>
      ) : null}
    </KeyboardAvoidingScreen>
  );
}
