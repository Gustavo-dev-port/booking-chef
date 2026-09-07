import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from 'expo-router';

/**
 * Intercepta a saída da tela (botão de voltar, gesto, botão físico do
 * Android) quando há mudanças não salvas, em vez de deixar simplesmente
 * sumir — pedido do usuário depois de testar: "Salvar fica lá embaixo,
 * fica difícil lembrar que tem que clicar".
 *
 * `onSave` deve ser o MESMO handler do botão "Salvar" da tela (ex.:
 * `handleSubmit(onSubmit)`) — se salvar der certo, quem chama continua
 * responsável por navegar de volta (ex.: `router.back()` dentro do
 * `onSubmit`, depois de um `reset(getValues())` pra zerar `isDirty` e
 * essa mesma saída não abrir o aviso de novo). Esse hook só cuida do
 * "Descartar" sozinho.
 */
export function useConfirmDiscardChanges(isDirty: boolean, onSave: () => void) {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty) return;
      e.preventDefault();
      Alert.alert('Sair sem salvar?', 'Você tem mudanças não salvas nesta tela.', [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        { text: 'Salvar', onPress: onSave },
      ]);
    });
    return unsubscribe;
  }, [navigation, isDirty, onSave]);
}
