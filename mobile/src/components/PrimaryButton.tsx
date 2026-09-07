import { ActivityIndicator, Pressable } from 'react-native';
import { AppText } from './AppText';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline';
  /** 'danger' = vermelho (ações destrutivas, ex.: excluir conta) em vez da marca. */
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Mostra um spinner no lugar do texto e desabilita o toque — usado durante chamadas ao Supabase. */
  loading?: boolean;
};

const COLORS = {
  default: {
    solidBg: 'bg-brand active:bg-brand-pressed dark:bg-brand-dark dark:active:bg-brand-dark',
    border: 'border-brand dark:border-brand-dark',
    activeBg: 'active:bg-warning-bg dark:active:bg-surface-border-dark',
    text: 'text-brand dark:text-brand-dark',
    // Off-white do mock em vez de branco puro (Design System v1, "05 ·
    // Componentes") — mesmo tom que o spinner de loading já usava abaixo.
    onSolidText: 'text-[#FFF4EA]',
    hex: '#C2551F',
  },
  danger: {
    solidBg: 'bg-danger active:bg-danger-pressed dark:bg-danger-dark dark:active:bg-danger-dark',
    border: 'border-danger dark:border-danger-dark',
    activeBg: 'active:bg-danger-bg dark:active:bg-surface-border-dark',
    text: 'text-danger dark:text-danger-dark',
    onSolidText: 'text-[#FFF1EF]',
    hex: '#A82D22',
  },
};

/**
 * Botão principal reutilizável em todo o app — área de toque mínima 44x44,
 * texto legível (16px+), alto contraste. Ver "05 · Componentes" do Design
 * System v1 (claude.ai/design, "Booking Chef - Design System"): variantes
 * Primary/Secondary/Destrutivo mapeiam pra cima de variant/tone
 * (Primary = solid+default, Secondary = outline+default, Destrutivo =
 * solid+danger) — muda só a aparência aqui dentro, sem precisar tocar nas
 * ~18 telas que já chamam PrimaryButton com essa mesma API.
 *
 * Pressed = escurece um passo + (no solid) mantém contraste; feito via
 * `active:` do NativeWind, sem JS/Reanimated — como o próprio design pede
 * ("Pressable com active: resolve o pressed sem JS").
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
          : `min-h-[44px] items-center justify-center rounded-xl border-[1.5px] px-6 py-3 ${colors.border} ${colors.activeBg}`) +
        (isDisabled ? ' opacity-50' : '')
      }
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? '#FFF4EA' : colors.hex} />
      ) : (
        <AppText className={`font-archivo-semibold text-base ${isSolid ? colors.onSolidText : colors.text}`}>{label}</AppText>
      )}
    </Pressable>
  );
}
