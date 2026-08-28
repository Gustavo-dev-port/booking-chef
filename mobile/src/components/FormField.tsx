import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type FormFieldProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** Texto de ajuda (ex.: "Mínimo de 8 caracteres") — some quando o campo tem erro, pra não duplicar mensagem. */
  hint?: string;
  /** Mostra um botão "Mostrar/Ocultar" dentro do campo — só faz sentido junto com secureTextEntry. */
  showPasswordToggle?: boolean;
};

/**
 * Campo de texto padrão dos formulários (login, cadastro, onboarding) —
 * label + input (44px mínimo de toque) + erro do Zod/React Hook Form
 * abaixo, tudo integrado via Controller.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  showPasswordToggle,
  secureTextEntry,
  ...inputProps
}: FormFieldProps<T>) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="mb-1 text-base text-gray-700">{label}</Text>
          <View className="relative justify-center">
            <TextInput
              accessibilityLabel={label}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value === undefined || value === null ? '' : String(value)}
              secureTextEntry={showPasswordToggle ? !revealed : secureTextEntry}
              className={
                'min-h-[44px] rounded-xl border px-4 text-base text-gray-900 ' +
                (showPasswordToggle ? 'pr-20 ' : '') +
                (error ? 'border-red-500' : 'border-gray-300')
              }
              {...inputProps}
            />
            {showPasswordToggle ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}
                onPress={() => setRevealed((v) => !v)}
                className="absolute right-2 h-11 items-center justify-center px-2"
              >
                <Text className="text-sm font-medium text-blue-600">{revealed ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            ) : null}
          </View>
          {error?.message ? (
            <Text className="mt-1 text-sm text-red-600">{error.message}</Text>
          ) : hint ? (
            <Text className="mt-1 text-sm text-gray-500">{hint}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
