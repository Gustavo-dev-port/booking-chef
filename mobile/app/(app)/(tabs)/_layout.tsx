import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Home, Package, Users, User } from 'lucide-react-native';
import { useAuthStore } from '../../../src/features/auth/store';
import { canManageBusiness, resolveAppRole } from '../../../src/features/team/permissions';

/**
 * Barra de navegação inferior (Design System v1, seção 05 do mock —
 * "claude.ai/design", ver commit "implementa Design System v1"): Início,
 * Estoque, Equipe, Perfil. Bar/Cozinha/Gerar Booking ficam de fora — não
 * são destino de navegação persistente, continuam como cards da Home.
 *
 * Estoque/Equipe usam `href: null` pra sumir da barra quando o papel não
 * administra o negócio — mesmo critério condicional que os ModuleCard
 * dessas duas seções tinham na Home antes desta mudança (ver
 * src/features/team/permissions.ts). É só a camada de conveniência visual:
 * a proteção de verdade continua sendo o `useRoleGuard` de cada tela + a
 * RLS no banco, sem alteração aqui.
 *
 * Toda tela fora deste grupo (Bar/Cozinha, Gerar Booking, detalhe/histórico
 * de insumo, edição de ficha) continua fora do `Tabs` — a barra some
 * sozinha ao empilhar essas telas por cima, sem show/hide manual (padrão
 * do próprio expo-router pra Tabs aninhado num Stack).
 */
export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const role = useAuthStore((s) => resolveAppRole(s.membership));
  const dark = colorScheme === 'dark';

  const activeColor = dark ? '#E8763A' : '#C2551F'; // brand.dark / brand
  const inactiveColor = dark ? '#9A8B7B' : '#7A6A5A'; // ink.secondary-dark / ink.secondary
  const barBackground = dark ? '#1D1814' : '#FFFDFA'; // surface.card-dark / surface.card
  const barBorder = dark ? '#2E2620' : '#E8DDCC'; // surface.border-dark / surface.border

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: { backgroundColor: barBackground, borderTopColor: barBorder },
        // Estado ativo nunca é só cor (mesma regra de src/features/inventory/stockStatus.ts
        // e src/features/recipes/cmv.ts) — reforça com peso de fonte.
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            className={focused ? 'text-xs font-archivo-semibold' : 'text-xs font-archivo'}
            style={{ color }}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color, size }) => <Home color={color} size={size} strokeWidth={focused ? 2.2 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Estoque',
          href: canManageBusiness(role) ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => <Package color={color} size={size} strokeWidth={focused ? 2.2 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'Equipe',
          href: canManageBusiness(role) ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => <Users color={color} size={size} strokeWidth={focused ? 2.2 : 1.8} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => <User color={color} size={size} strokeWidth={focused ? 2.2 : 1.8} />,
        }}
      />
    </Tabs>
  );
}
