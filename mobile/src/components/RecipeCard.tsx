import { Image, Pressable, Text, View } from 'react-native';
import { useRecipePhotoUrl } from '../hooks/useRecipePhotoUrl';
import type { RecipeSummary } from '../features/recipes/api';

type RecipeCardProps = {
  recipe: RecipeSummary;
  onPress: () => void;
};

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const photoUrl = useRecipePhotoUrl(recipe.photo_path);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recipe.name}
      onPress={onPress}
      className="mb-3 min-h-[44px] flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 active:bg-gray-50"
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} className="h-14 w-14 rounded-xl bg-gray-100" />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
          <Text className="text-xl">🍽️</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {recipe.name}
        </Text>
        {recipe.category ? (
          <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
            {recipe.category}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
