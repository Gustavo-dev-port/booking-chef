import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../../../../src/components/FormField';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import {
  recipeSchema,
  isRecipeType,
  type RecipeInput,
  type RecipeFormValues,
} from '../../../../src/validators/recipe';
import {
  archiveRecipe,
  createRecipe,
  getRecipe,
  setRecipePhoto,
  updateRecipe,
} from '../../../../src/features/recipes/api';
import { pickPhoto, uploadRecipePhoto, type PickedPhoto } from '../../../../src/features/recipes/photos';
import { useRecipePhotoUrl } from '../../../../src/hooks/useRecipePhotoUrl';
import { useAuthStore } from '../../../../src/features/auth/store';

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
};

/**
 * Editor de ficha técnica — cria (id === "new") ou edita. Campos
 * condicionais: copo/decoração só aparecem pra Bar, peso final só pra
 * Cozinha (ver FASE1-ARQUITETURA-MOBILE.md, seção 5).
 */
export default function RecipeEditorScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const rawType = params.type ?? '';
  const type = isRecipeType(rawType) ? rawType : 'bar';
  const isNew = params.id === 'new';
  const companyId = useAuthStore((s) => s.membership?.company_id);

  const [loading, setLoading] = useState(!isNew);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(null);
  const [pickedPhoto, setPickedPhoto] = useState<PickedPhoto | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RecipeFormValues, unknown, RecipeInput>({
    resolver: zodResolver(recipeSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });

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
        ingredients: recipe.ingredients.map((i) => ({
          ingredientName: i.ingredient_name,
          quantity: i.quantity,
          unit: i.unit,
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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-gray-500">Carregando…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-16">
      <Text className="mb-6 text-2xl font-bold text-gray-900">
        {isNew ? 'Nova ficha' : 'Editar ficha'}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escolher foto"
        onPress={handlePickPhoto}
        className="mb-4 h-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50"
      >
        {displayedPhotoUri ? (
          <Image source={{ uri: displayedPhotoUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Text className="text-sm text-gray-500">Toque para adicionar uma foto</Text>
        )}
      </Pressable>

      <FormField control={control} name="name" label="Nome" />
      <FormField control={control} name="category" label="Categoria (opcional)" />
      <FormField control={control} name="yieldAmount" label="Rendimento (ex.: 1 dose, 4 porções)" />

      {type === 'bar' ? (
        <>
          <FormField control={control} name="glassType" label="Copo utilizado" />
          <FormField control={control} name="garnish" label="Decoração" />
        </>
      ) : (
        <FormField control={control} name="finalWeight" label="Peso final" />
      )}

      <Text className="mb-3 mt-2 text-base font-semibold text-gray-900">Ingredientes</Text>
      {fields.map((field, index) => (
        <View key={field.id} className="mb-2 flex-row items-start gap-2">
          <View className="flex-[2]">
            <FormField control={control} name={`ingredients.${index}.ingredientName`} label="Ingrediente" />
          </View>
          <View className="flex-1">
            <FormField
              control={control}
              name={`ingredients.${index}.quantity`}
              label="Qtd."
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <FormField control={control} name={`ingredients.${index}.unit`} label="Unidade" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remover ingrediente"
            onPress={() => remove(index)}
            className="mt-9 h-11 w-11 items-center justify-center"
          >
            <Text className="text-lg text-red-600">✕</Text>
          </Pressable>
        </View>
      ))}
      <View className="mb-4">
        <PrimaryButton
          label="+ Adicionar ingrediente"
          variant="outline"
          onPress={() => append({ ingredientName: '', quantity: 0, unit: '' })}
        />
      </View>

      <FormField
        control={control}
        name="instructions"
        label="Modo de preparo"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="min-h-[100px] rounded-xl border border-gray-300 px-4 py-3 text-base"
      />
      <FormField
        control={control}
        name="notes"
        label="Observações (opcional)"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="min-h-[80px] rounded-xl border border-gray-300 px-4 py-3 text-base"
      />

      {formError ? <Text className="mb-4 text-sm text-red-600">{formError}</Text> : null}

      <View className="mb-3">
        <PrimaryButton label="Salvar ficha" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>

      {!isNew ? <PrimaryButton label="Arquivar ficha" variant="outline" onPress={handleArchive} /> : null}
    </ScrollView>
  );
}
