import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '../src/components/AppText';
import { BackButton } from '../src/components/BackButton';
import { PrimaryButton } from '../src/components/PrimaryButton';

/**
 * Política de Privacidade — texto placeholder genérico (Fase 6), a
 * substituir antes de publicação real. Ver nota em terms.tsx.
 */
export default function PrivacyScreen() {
  return (
    <ScrollView className="flex-1 bg-surface-card dark:bg-surface-card-dark" contentContainerClassName="px-6 py-16">
      <BackButton />
      <AppText className="mb-1 text-2xl font-archivo-bold text-ink dark:text-ink-dark">Política de Privacidade</AppText>
      <View className="mb-6 rounded-xl bg-warning-bg dark:bg-surface-border-dark px-4 py-3">
        <AppText className="text-sm text-warning-text dark:text-warning-dark">
          Texto placeholder — ainda não revisado por advogado. Substituir antes de qualquer publicação
          real do app.
        </AppText>
      </View>

      <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Quais dados coletamos</AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Nome, e-mail e telefone (opcional) do usuário; CNPJ, razão social, nome fantasia, segmento,
        cidade e estado do estabelecimento; e o conteúdo que você cadastra (fichas técnicas,
        ingredientes, fotos).
      </AppText>

      <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Como usamos</AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Só para operar o App: autenticar sua conta, associar o conteúdo ao seu estabelecimento e gerar
        os PDFs de booking que você solicitar. Não vendemos nem compartilhamos seus dados com
        terceiros para fins de marketing.
      </AppText>

      <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Onde ficam armazenados</AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Banco de dados e armazenamento de arquivos do Supabase, com controle de acesso por empresa
        (Row Level Security) — cada estabelecimento só enxerga os próprios dados.
      </AppText>

      <AppText className="mb-2 text-base font-archivo-semibold text-ink dark:text-ink-dark">Seus direitos (LGPD)</AppText>
      <AppText className="mb-4 text-base leading-6 text-ink dark:text-ink-dark">
        Você pode acessar, corrigir ou excluir seus dados a qualquer momento. A exclusão de conta
        (tela de Perfil) apaga permanentemente seu usuário, seu estabelecimento e todo o conteúdo
        associado — inclusive fotos — de forma irreversível.
      </AppText>

      <AppText className="mb-8 text-base leading-6 text-ink dark:text-ink-dark">
        Dúvidas sobre privacidade podem ser encaminhadas para o suporte do estabelecimento responsável
        pelo App.
      </AppText>

      <PrimaryButton label="Voltar" variant="outline" onPress={() => router.back()} />
    </ScrollView>
  );
}
