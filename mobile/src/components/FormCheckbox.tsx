import { Pressable, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { AppText } from './AppText';

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
                (value ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark' : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
              }
            >
              {value ? <AppText className="text-xs font-archivo-bold text-white">✓</AppText> : null}
            </View>
            <AppText className="flex-1 text-base text-ink dark:text-ink-dark">{label}</AppText>
          </Pressable>
          {error?.message ? <AppText className="mt-1 text-sm text-danger dark:text-danger-dark">{error.message}</AppText> : null}
        </View>
      )}
    />
  );
}
