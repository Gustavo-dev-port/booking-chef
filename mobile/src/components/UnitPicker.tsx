import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { AppText } from './AppText';
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
            <AppText className="mb-1 text-base text-ink dark:text-ink-dark">{label}</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => setOpen(true)}
              className={
                'min-h-[44px] items-center justify-center rounded-xl border px-3 ' +
                (error ? 'border-danger dark:border-danger-dark' : 'border-surface-input-border dark:border-surface-border-dark')
              }
            >
              <AppText className={selected ? 'text-base text-ink dark:text-ink-dark' : 'text-base text-ink-secondary dark:text-ink-dark0'}>
                {selected ? selected.label : 'Un.'}
              </AppText>
            </Pressable>
            {error?.message ? <AppText className="mt-1 text-sm text-danger dark:text-danger-dark">{error.message}</AppText> : null}

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
              <Pressable
                accessibilityLabel="Fechar"
                className="flex-1 justify-end bg-black/40"
                onPress={() => setOpen(false)}
              >
                <View className="rounded-t-2xl bg-surface-card dark:bg-surface-card-dark p-4 pb-8">
                  <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Unidade</AppText>
                  {INGREDIENT_UNITS.map((unit) => (
                    <Pressable
                      key={unit.value}
                      accessibilityRole="button"
                      accessibilityLabel={unit.label}
                      onPress={() => {
                        onChange(unit.value);
                        setOpen(false);
                      }}
                      className="min-h-[44px] justify-center border-b border-surface-border dark:border-surface-border-dark px-2"
                    >
                      <AppText
                        className={
                          value === unit.value ? 'text-base font-archivo-semibold text-brand dark:text-brand-dark' : 'text-base text-ink dark:text-ink-dark'
                        }
                      >
                        {unit.label}
                      </AppText>
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
