import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { INGREDIENT_UNITS } from '../validators/recipe';

type UnitPickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

/**
 * Seletor compacto de unidade (Kg/g/L/mL/Un) — um botão que abre uma
 * folha de opções, em vez de chips lado a lado (que não cabem na coluna
 * estreita da linha de ingrediente, ao lado de nome e quantidade).
 */
export function UnitPicker<T extends FieldValues>({ control, name, label = 'Unidade' }: UnitPickerProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selected = INGREDIENT_UNITS.find((u) => u.value === value);
        return (
          <View>
            <Text className="mb-1 text-base text-gray-700 dark:text-gray-300">{label}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => setOpen(true)}
              className={
                'min-h-[44px] items-center justify-center rounded-xl border px-3 ' +
                (error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700')
              }
            >
              <Text className={selected ? 'text-base text-gray-900 dark:text-gray-50' : 'text-base text-gray-400 dark:text-gray-500'}>
                {selected ? selected.label : 'Un.'}
              </Text>
            </Pressable>
            {error?.message ? <Text className="mt-1 text-sm text-red-600">{error.message}</Text> : null}

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
              <Pressable
                accessibilityLabel="Fechar"
                className="flex-1 justify-end bg-black/40"
                onPress={() => setOpen(false)}
              >
                <View className="rounded-t-2xl bg-white dark:bg-gray-900 p-4 pb-8">
                  <Text className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-50">Unidade</Text>
                  {INGREDIENT_UNITS.map((unit) => (
                    <Pressable
                      key={unit.value}
                      accessibilityRole="button"
                      accessibilityLabel={unit.label}
                      onPress={() => {
                        onChange(unit.value);
                        setOpen(false);
                      }}
                      className="min-h-[44px] justify-center border-b border-gray-100 dark:border-gray-800 px-2"
                    >
                      <Text
                        className={
                          value === unit.value ? 'text-base font-semibold text-blue-600' : 'text-base text-gray-900 dark:text-gray-50'
                        }
                      >
                        {unit.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
        );
      }}
    />
  );
}
