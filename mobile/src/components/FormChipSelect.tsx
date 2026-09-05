import { Pressable, Text, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type Option = { value: string; label: string };

type FormChipSelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: readonly Option[];
};

/**
 * Seletor de opção única em "chips" — evita depender de um picker nativo
 * (nenhuma lib de picker está no projeto ainda) para listas curtas como
 * segmento e tamanho do negócio.
 */
export function FormChipSelect<T extends FieldValues>({ control, name, label, options }: FormChipSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="mb-1 text-base text-ink dark:text-ink-dark">{label}</Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const selected = value === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected }}
                  onPress={() => onChange(option.value)}
                  className={
                    'min-h-[44px] items-center justify-center rounded-full border px-4 py-2 ' +
                    (selected ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
                  }
                >
                  <Text className={selected ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {error?.message ? <Text className="mt-1 text-sm text-danger dark:text-danger-dark">{error.message}</Text> : null}
        </View>
      )}
    />
  );
}
