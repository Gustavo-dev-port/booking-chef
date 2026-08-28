import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type FormFieldProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

/**
 * Campo de texto padrão dos formulários (login, cadastro, onboarding) —
 * label + input (44px mínimo de toque) + erro do Zod/React Hook Form
 * abaixo, tudo integrado via Controller.
 */
export function FormField<T extends FieldValues>({ control, name, label, ...inputProps }: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="mb-1 text-base text-gray-700">{label}</Text>
          <TextInput
            accessibilityLabel={label}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value === undefined || value === null ? '' : String(value)}
            className={
              'min-h-[44px] rounded-xl border px-4 text-base ' +
              (error ? 'border-red-500' : 'border-gray-300')
            }
            {...inputProps}
          />
          {error?.message ? <Text className="mt-1 text-sm text-red-600">{error.message}</Text> : null}
        </View>
      )}
    />
  );
}
