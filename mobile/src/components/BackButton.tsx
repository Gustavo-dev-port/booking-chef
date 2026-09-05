import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ChevronLeft } from 'lucide-react-native';

/**
 * Botão "voltar" padrão — em toda tela alcançada por navegação (ou seja,
 * todas menos Login e Home, que são as entradas de cada fluxo e não têm
 * uma tela anterior de verdade pra voltar). Cabeçalhos nativos ficam
 * desligados (`headerShown: false`) em todo o app de propósito, pra manter
 * a mesma cara em todas as telas — por isso esse botão é desenhado à mão
 * em vez de vir do header do Stack.
 *
 * Ícone Lucide (chevron-left, traço 1.8) no lugar do glifo "←" — Design
 * System v1, seção "06 · Ícones".
 */
export function BackButton() {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? '#F6EFE6' : '#1E1813';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      onPress={() => router.back()}
      hitSlop={8}
      className="mb-4 h-11 w-11 items-center justify-center"
    >
      <ChevronLeft size={26} color={color} strokeWidth={1.8} />
    </Pressable>
  );
}
