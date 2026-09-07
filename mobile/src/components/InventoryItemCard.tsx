import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import type { InventoryItem } from '../features/inventory/api';
import { ingredientUnitLabel } from '../validators/recipe';
import { computeStockStatus, STOCK_STATUS_CLASSES, STOCK_STATUS_LABELS } from '../features/inventory/stockStatus';

type InventoryItemCardProps = {
  item: InventoryItem;
  categoryName: string | null;
  onPress: () => void;
};

/**
 * Design System v1, "05 · Componentes → Tags de estoque": tag com rótulo
 * (nunca só cor — daltônicos leem a lista igual) em vez do texto vermelho
 * fixo usado antes só pra "abaixo do mínimo".
 */
export function InventoryItemCard({ item, categoryName, onPress }: InventoryItemCardProps) {
  const status = computeStockStatus(item.current_quantity, item.minimum_quantity);
  const unitLabel = ingredientUnitLabel(item.usage_unit);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      className="mb-3 min-h-[44px] flex-row items-center justify-between gap-3 rounded-2xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark p-3 active:bg-surface-alt dark:active:bg-surface-page-dark"
    >
      <View className="flex-1">
        <AppText className="font-archivo-bold text-base text-ink dark:text-ink-dark" numberOfLines={1}>
          {item.name}
        </AppText>
        {categoryName ? (
          <AppText className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondary-dark" numberOfLines={1}>
            {categoryName}
          </AppText>
        ) : null}
      </View>
      <View className="items-end gap-1">
        <AppText className="text-base font-archivo-semibold text-ink dark:text-ink-dark">
          {item.current_quantity} {unitLabel}
        </AppText>
        <AppText className="text-xs text-ink-secondary dark:text-ink-secondary-dark">
          mín. {item.minimum_quantity} {unitLabel}
        </AppText>
        <View className={`rounded-lg px-2 py-0.5 ${STOCK_STATUS_CLASSES[status]}`}>
          <AppText className={`font-archivo-bold text-xs ${STOCK_STATUS_CLASSES[status]}`}>
            {STOCK_STATUS_LABELS[status]}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
