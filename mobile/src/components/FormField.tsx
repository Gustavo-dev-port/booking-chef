import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { AppText } from './AppText';

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
          <AppText className="mb-1 font-archivo-semibold text-base text-ink dark:text-ink-dark">{label}</AppText>
          <View className="relative justify-center">
            <TextInput
              accessibilityLabel={label}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value === undefined || value === null ? '' : String(value)}
              secureTextEntry={showPasswordToggle ? !revealed : secureTextEntry}
              placeholderTextColor="#A6937F"
              className={
                'min-h-[48px] rounded-2xl border bg-surface-card px-4 font-archivo text-base text-ink focus:border-[1.5px] focus:border-brand dark:bg-surface-card-dark dark:text-ink-dark dark:focus:border-brand-dark ' +
                (showPasswordToggle ? 'pr-20 ' : '') +
                (error ? 'border-danger dark:border-danger-dark' : 'border-surface-input-border dark:border-surface-border-dark')
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
                <AppText className="text-sm font-archivo-medium text-brand dark:text-brand-dark">{revealed ? 'Ocultar' : 'Mostrar'}</AppText>
              </Pressable>
            ) : null}
          </View>
          {error?.message ? (
            <AppText className="mt-1 text-sm text-danger dark:text-danger-dark">{error.message}</AppText>
          ) : hint ? (
            <AppText className="mt-1 text-sm text-ink-secondary dark:text-ink-secondary-dark">{hint}</AppText>
          ) : null}
        </View>
      )}
    />
  );
}
