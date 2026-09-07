import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '../src/components/AppText';
import { BackButton } from '../src/components/BackButton';
import { PrimaryButton } from '../src/components/PrimaryButton';

/**
 * Termos de Uso — texto placeholder genérico (Fase 6), mesmo espírito do
 * "Termos de Uso (placeholder)" já registrado no plano do app web
 * (FASE1-ARQUITETURA.md). NÃO é texto revisado por advogado — substituir
 * antes de qualquer publicação real. Rota sempre acessível (fora dos
 * grupos protegidos), porque precisa abrir tanto a partir do onboarding
 * (usuário logado, sem empresa ainda) quanto do perfil (usuário já
 * dentro do app).
 */
export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="px-6 py-16">
      <BackButton />
      <AppText className="mb-1 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Termos de Uso</AppText>
      <View className="mb-6 rounded-xl bg-warning-bg dark:bg-surface-border-dark px-4 py-3">
        <AppText className="text-sm text-warning-text dark:text-warning-dark">
          Texto placeholder — ainda não revisado por advogado. Substituir antes de qualquer publicação
          real do app.
        </AppText>
      </View>

      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Estes Termos de Uso regulam o acesso e a utilização do aplicativo (o "App"), destinado a
        auxiliar bares, restaurantes e estabelecimentos similares na organização de suas fichas
        técnicas.
      </AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Ao criar uma conta, você confirma que as informações fornecidas (nome, e-mail, dados do
        estabelecimento) são verdadeiras e que é responsável por mantê-las atualizadas e por manter a
        confidencialidade da sua senha.
      </AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        O conteúdo cadastrado (fichas técnicas, ingredientes, fotos) é de responsabilidade exclusiva de
        quem o insere. O App não se responsabiliza por decisões tomadas com base nesse conteúdo.
      </AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Você pode encerrar sua conta a qualquer momento pela tela de Perfil. O encerramento remove
        permanentemente seus dados e os do seu estabelecimento, conforme descrito na Política de
        Privacidade.
      </AppText>
      <AppText className="mb-8 text-base leading-6 text-ink dark:text-ink-dark">
        Podemos atualizar estes Termos eventualmente; mudanças relevantes serão comunicadas dentro do
        App.
      </AppText>

      <PrimaryButton label="Voltar" variant="outline" onPress={() => router.back()} />
    </ScrollView>
  );
}
