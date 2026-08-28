import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';

/**
 * Botão "voltar" padrão — em toda tela alcançada por navegação (ou seja,
 * todas menos Login e Home, que são as entradas de cada fluxo e não têm
 * uma tela anterior de verdade pra voltar). Cabeçalhos nativos ficam
 * desligados (`headerShown: false`) em todo o app de propósito, pra manter
 * a mesma cara em todas as telas — por isso esse botão é desenhado à mão
 * em vez de vir do header do Stack.
 */
export function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      onPress={() => router.back()}
      hitSlop={8}
      className="mb-4 h-11 w-11 items-center justify-center"
    >
      <Text className="text-2xl text-gray-900 dark:text-gray-50">←</Text>
    </Pressable>
  );
}
