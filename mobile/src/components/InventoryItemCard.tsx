import { Pressable, Text, View } from 'react-native';
import type { InventoryItem } from '../features/inventory/api';
import { ingredientUnitLabel } from '../validators/recipe';

type InventoryItemCardProps = {
  item: InventoryItem;
  categoryName: string | null;
  onPress: () => void;
};

export function InventoryItemCard({ item, categoryName, onPress }: InventoryItemCardProps) {
  const belowMinimum = item.current_quantity < item.minimum_quantity;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      className="mb-3 min-h-[44px] flex-row items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 active:bg-gray-50 dark:active:bg-gray-950"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>
          {item.name}
        </Text>
        {categoryName ? (
          <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {categoryName}
          </Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text
          className={
            'text-base font-semibold ' + (belowMinimum ? 'text-red-600' : 'text-gray-900 dark:text-gray-50')
          }
        >
          {item.current_quantity} {ingredientUnitLabel(item.usage_unit)}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          mín. {item.minimum_quantity} {ingredientUnitLabel(item.usage_unit)}
        </Text>
        {belowMinimum ? (
          <Text className="mt-0.5 text-xs font-semibold text-red-600">Repor</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
