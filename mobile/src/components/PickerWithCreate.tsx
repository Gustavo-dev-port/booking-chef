import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

type Option = { id: string; name: string };

type PickerWithCreateProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: Option[];
  onCreate: (name: string) => Promise<Option>;
  onCreated: (option: Option) => void;
};

/**
 * Chips de opção + "+ Nova" que revela um campo de texto inline — mesmo
 * espírito da conciliação de insumos (Fase 8, "achar ou criar"), mas
 * disparado pelo usuário na hora, não em segundo plano. Usado pra
 * categoria e fornecedor no cadastro de insumo (V2, Épico 06), que ainda
 * não têm tela de cadastro própria.
 */
export function PickerWithCreate<T extends FieldValues>({
  control,
  name,
  label,
  options,
  onCreate,
  onCreated,
}: PickerWithCreateProps<T>) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="mb-1 text-base text-ink dark:text-ink-dark">{label}</Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const selected = value === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityLabel={option.name}
                  accessibilityState={{ selected }}
                  onPress={() => onChange(option.id)}
                  className={
                    'min-h-[44px] items-center justify-center rounded-full border px-4 py-2 ' +
                    (selected
                      ? 'border-brand dark:border-brand-dark bg-brand dark:bg-brand-dark'
                      : 'border-surface-input-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark')
                  }
                >
                  <Text
                    className={
                      selected ? 'text-sm font-archivo-semibold text-white' : 'text-sm text-ink dark:text-ink-dark'
                    }
                  >
                    {option.name}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Nova opção de ${label.toLowerCase()}`}
              onPress={() => setCreating(true)}
              className="min-h-[44px] items-center justify-center rounded-full border border-dashed border-surface-input-border dark:border-surface-border-dark px-4 py-2"
            >
              <Text className="text-sm text-ink-secondary dark:text-ink-secondary-dark">+ Nova</Text>
            </Pressable>
          </View>
          {error?.message ? <Text className="mt-1 text-sm text-danger dark:text-danger-dark">{error.message}</Text> : null}

          {creating ? (
            <View className="mt-2 flex-row items-center gap-2">
              <TextInput
                autoFocus
                value={newName}
                onChangeText={setNewName}
                placeholder={`Nome`}
                accessibilityLabel={`Nome da nova ${label.toLowerCase()}`}
                className="min-h-[44px] flex-1 rounded-xl border border-surface-input-border dark:border-surface-border-dark px-4 text-base text-ink dark:text-ink-dark"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Salvar"
                onPress={async () => {
                  const trimmed = newName.trim();
                  if (!trimmed || saving) return;
                  setSaving(true);
                  try {
                    const created = await onCreate(trimmed);
                    onCreated(created);
                    onChange(created.id);
                    setNewName('');
                    setCreating(false);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="h-11 w-11 items-center justify-center rounded-xl bg-brand dark:bg-brand-dark"
              >
                <Text className="text-lg text-white">✓</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
    />
  );
}
