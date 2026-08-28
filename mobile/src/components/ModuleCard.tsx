import { Pressable, Text, View } from 'react-native';

type ModuleCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

/**
 * Card grande da Home (🍸 Bar / 👨‍🍳 Cozinha / 📖 Gerar Booking) — ícone + legenda,
 * máximo de informação necessária, seguindo o design minimalista pedido no plano.
 */
export function ModuleCard({ icon, title, subtitle, onPress }: ModuleCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
      onPress={onPress}
      className="min-h-[44px] flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-6 active:bg-gray-50"
    >
      <Text className="mb-2 text-4xl">{icon}</Text>
      <Text className="text-base font-semibold text-gray-900">{title}</Text>
      <Text className="mt-1 text-center text-sm text-gray-500">{subtitle}</Text>
    </Pressable>
  );
}
