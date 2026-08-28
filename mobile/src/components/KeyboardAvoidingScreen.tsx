import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from 'react-native';

/**
 * Substitui o <ScrollView> nas telas com formulário — sem isso, o teclado
 * cobria o campo focado (pedido do usuário). iOS não reposiciona sozinho
 * (por isso o KeyboardAvoidingView); Android já empurra a tela via
 * `windowSoftInputMode="adjustResize"` (ver app.json), então aqui o
 * `behavior="height"` é só reforço.
 */
export function KeyboardAvoidingScreen({ children, ...scrollViewProps }: ScrollViewProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" {...scrollViewProps}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
