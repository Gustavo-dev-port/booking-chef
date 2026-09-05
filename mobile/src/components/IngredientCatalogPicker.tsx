import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
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
        className="min-h-[44px] items-center justify-center rounded-xl border border-dashed border-blue-600 px-3"
      >
        <Text className="text-sm font-medium text-blue-600">🔗 Estoque</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Fechar" className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <View className="max-h-[70%] rounded-t-2xl bg-white dark:bg-gray-900 p-4">
            <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-50">
              Selecionar do estoque
            </Text>
            <TextInput
              accessibilityLabel="Buscar insumo"
              placeholder="Buscar insumo"
              value={search}
              onChangeText={setSearch}
              autoFocus
              className="mb-3 min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-700 px-4 text-base text-gray-900 dark:text-gray-50"
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
                  className="min-h-[44px] flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 py-3"
                >
                  <Text className="flex-1 pr-2 text-base text-gray-900 dark:text-gray-50" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    R$ {(item.unit_cost ?? 0).toFixed(2)}/{ingredientUnitLabel(item.usage_unit)}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {items.length === 0
                    ? 'Nenhum insumo cadastrado no estoque ainda.'
                    : 'Nenhum insumo encontrado.'}
                </Text>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
