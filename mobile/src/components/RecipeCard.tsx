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
      className="mb-3 min-h-[44px] flex-row items-center gap-3 rounded-2xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3 active:bg-surface-alt dark:active:bg-surface-page-dark"
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} className="h-14 w-14 rounded-xl bg-surface-alt dark:bg-surface-card-dark" />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-surface-alt dark:bg-surface-card-dark">
          <Text className="text-xl">🍽️</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-archivo-semibold text-ink dark:text-ink-dark" numberOfLines={1}>
          {recipe.name}
        </Text>
        {recipe.category ? (
          <Text className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondary-dark" numberOfLines={1}>
            {recipe.category}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
