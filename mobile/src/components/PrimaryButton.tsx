import { ActivityIndicator, Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline';
  /** 'danger' = vermelho (ações destrutivas, ex.: excluir conta) em vez do azul padrão. */
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Mostra um spinner no lugar do texto e desabilita o toque — usado durante chamadas ao Supabase. */
  loading?: boolean;
};

const COLORS = {
  default: { solidBg: 'bg-blue-600 active:bg-blue-700', border: 'border-blue-600', text: 'text-blue-600', hex: '#2563eb' },
  danger: { solidBg: 'bg-red-600 active:bg-red-700', border: 'border-red-600', text: 'text-red-600', hex: '#dc2626' },
};

/**
 * Botão principal reutilizável em todo o app — área de toque mínima 44x44,
 * texto legível (16px+), alto contraste. Ver seção "Acessibilidade" do plano.
 */
export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  tone = 'default',
  disabled,
  loading,
}: PrimaryButtonProps) {
  const isSolid = variant === 'solid';
  const isDisabled = disabled || loading;
  const colors = COLORS[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      className={
        (isSolid
          ? `min-h-[44px] items-center justify-center rounded-xl px-6 py-3 ${colors.solidBg}`
          : `min-h-[44px] items-center justify-center rounded-xl border-2 px-6 py-3 ${colors.border}`) +
        (isDisabled ? ' opacity-50' : '')
      }
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? '#ffffff' : colors.hex} />
      ) : (
        <Text className={`text-base font-semibold ${isSolid ? 'text-white' : colors.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
