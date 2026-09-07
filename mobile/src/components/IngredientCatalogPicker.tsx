import { useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { AppText } from './AppText';
import type { InventoryItem } from '../features/inventory/api';
import { ingredientUnitLabel } from '../validators/recipe';

type IngredientCatalogPickerProps = {
  items: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
};

/**
 * Botão "🔗 Estoque" que abre uma busca no catálogo de insumos (V2, Épico
 * 07, história 07.1) — "texto livre continua disponível como
 * alternativa" (11_BACKLOG.md): isso é um botão a mais ao lado do campo
 * de texto livre, nunca substitui ele.
 */
export function IngredientCatalogPicker({ items, onSelect }: IngredientCatalogPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const visible = items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Vincular ao estoque"
        onPress={() => setOpen(true)}
        className="min-h-[44px] items-center justify-center rounded-xl border border-dashed border-brand dark:border-brand-dark px-3"
      >
        <AppText className="text-sm font-archivo-medium text-brand dark:text-brand-dark">🔗 Estoque</AppText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Fechar" className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <View className="max-h-[70%] rounded-t-2xl bg-surface-card dark:bg-surface-card-dark p-4">
            <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">
              Selecionar do estoque
            </AppText>
            <TextInput
              accessibilityLabel="Buscar insumo"
              placeholder="Buscar insumo"
              value={search}
              onChangeText={setSearch}
              autoFocus
              className="mb-3 min-h-[44px] rounded-xl border border-surface-input-border dark:border-surface-border-dark px-4 text-base text-ink dark:text-ink-dark"
            />
            <FlatList
              data={visible}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="min-h-[44px] flex-row items-center justify-between border-b border-surface-border dark:border-surface-border-dark py-3"
                >
                  <AppText className="flex-1 pr-2 text-base text-ink dark:text-ink-dark" numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <AppText className="text-sm text-ink-secondary dark:text-ink-secondary-dark">
                    R$ {(item.unit_cost ?? 0).toFixed(2)}/{ingredientUnitLabel(item.usage_unit)}
                  </AppText>
                </Pressable>
              )}
              ListEmptyComponent={
                <AppText className="py-4 text-center text-sm text-ink-secondary dark:text-ink-secondary-dark">
                  {items.length === 0
                    ? 'Nenhum insumo cadastrado no estoque ainda.'
                    : 'Nenhum insumo encontrado.'}
                </AppText>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
