import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import type { LucideIcon } from 'lucide-react-native';

type ModuleCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

/**
 * Card grande da Home (Bar / Cozinha / Gerar Booking / Estoque / Equipe) —
 * ícone + legenda, máximo de informação necessária. Ícone Lucide num
 * círculo, no lugar do emoji usado antes (🍸 👨‍🍳 📦...) — Design System v1
 * (claude.ai/design, "Booking Chef - Design System"), seção "06 · Ícones":
 * "substituem os emojis usados hoje em ModuleCard".
 */
export function ModuleCard({ icon: Icon, title, subtitle, onPress }: ModuleCardProps) {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#E8763A' : '#A8471A';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
      onPress={onPress}
      className="min-h-[44px] flex-1 items-center justify-center rounded-2xl border border-surface-border dark:border-surface-border-dark bg-surface-card dark:bg-surface-card-dark px-4 py-6 active:bg-surface-alt dark:active:bg-surface-page-dark"
    >
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-surface-alt dark:bg-surface-border-dark">
        <Icon size={24} color={iconColor} strokeWidth={1.8} />
      </View>
      <Text className="font-archivo-bold text-base text-ink dark:text-ink-dark">{title}</Text>
      <Text className="mt-1 text-center text-sm text-ink-secondary dark:text-ink-secondary-dark">{subtitle}</Text>
    </Pressable>
  );
}
