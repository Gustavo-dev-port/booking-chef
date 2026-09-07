import { Text, type TextProps } from 'react-native';

// Chaves de fontFamily do tailwind.config.js — se o chamador já passou uma
// família explícita (peso ou o serifado de título/número-herói), respeita
// ela; senão aplica Archivo regular como padrão.
const HAS_FONT_FAMILY = /\bfont-(archivo(-medium|-semibold|-bold)?|display)\b/;

/**
 * Resolve a className final de um AppText — extraída como função pura pra
 * ser testável sem depender de render (mesmo padrão de
 * src/features/inventory/stockStatus.ts / src/features/recipes/cmv.ts).
 *
 * Não dá pra confiar na ordem de escrita dentro da string `className` pra
 * decidir qual família "ganha" — testes do próprio NativeWind
 * (node_modules/react-native-css-interop/src/__tests__/specificity.test.tsx)
 * mostram que quem decide é a ordem de definição no CSS gerado, não a
 * ordem no atributo. Por isso a checagem é feita aqui em JS.
 */
export function resolveAppTextClassName(className?: string): string {
  if (className && HAS_FONT_FAMILY.test(className)) return className;
  return `font-archivo${className ? ` ${className}` : ''}`;
}

/**
 * Substitui o `Text` do React Native em todo o app (Design System v1) —
 * antes só texto com peso (font-bold/semibold/medium) herdava Archivo,
 * texto sem peso ficava na fonte do sistema. Ver app/_layout.tsx pro
 * carregamento das fontes.
 */
export function AppText({ className, ...props }: TextProps) {
  return <Text className={resolveAppTextClassName(className)} {...props} />;
}
