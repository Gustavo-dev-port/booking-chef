import { Pressable, Text, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type FormCheckboxProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

/** Checkbox padrão (termos de uso, opt-in de marketing) — área de toque 44x44. */
export function FormCheckbox<T extends FieldValues>({ control, name, label }: FormCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={label}
            accessibilityState={{ checked: !!value }}
            onPress={() => onChange(!value)}
            className="min-h-[44px] flex-row items-center gap-3"
          >
            <View
              className={
                'h-6 w-6 items-center justify-center rounded-md border-2 ' +
                (value ? 'border-blue-600 bg-blue-600' : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900')
              }
            >
              {value ? <Text className="text-xs font-bold text-white">✓</Text> : null}
            </View>
            <Text className="flex-1 text-base text-gray-700 dark:text-gray-300">{label}</Text>
          </Pressable>
          {error?.message ? <Text className="mt-1 text-sm text-red-600">{error.message}</Text> : null}
        </View>
      )}
    />
  );
}
