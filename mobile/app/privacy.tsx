import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '../src/components/BackButton';
import { PrimaryButton } from '../src/components/PrimaryButton';

/**
 * Política de Privacidade — texto placeholder genérico (Fase 6), a
 * substituir antes de publicação real. Ver nota em terms.tsx.
 */
export default function PrivacyScreen() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-16">
      <BackButton />
      <Text className="mb-1 text-2xl font-bold text-gray-900">Política de Privacidade</Text>
      <View className="mb-6 rounded-xl bg-amber-50 px-4 py-3">
        <Text className="text-sm text-amber-800">
          Texto placeholder — ainda não revisado por advogado. Substituir antes de qualquer publicação
          real do app.
        </Text>
      </View>

      <Text className="mb-2 text-base font-semibold text-gray-900">Quais dados coletamos</Text>
      <Text className="mb-4 text-base leading-6 text-gray-700">
        Nome, e-mail e telefone (opcional) do usuário; CNPJ, razão social, nome fantasia, segmento,
        cidade e estado do estabelecimento; e o conteúdo que você cadastra (fichas técnicas,
        ingredientes, fotos).
      </Text>

      <Text className="mb-2 text-base font-semibold text-gray-900">Como usamos</Text>
      <Text className="mb-4 text-base leading-6 text-gray-700">
        Só para operar o App: autenticar sua conta, associar o conteúdo ao seu estabelecimento e gerar
        os PDFs de booking que você solicitar. Não vendemos nem compartilhamos seus dados com
        terceiros para fins de marketing.
      </Text>

      <Text className="mb-2 text-base font-semibold text-gray-900">Onde ficam armazenados</Text>
      <Text className="mb-4 text-base leading-6 text-gray-700">
        Banco de dados e armazenamento de arquivos do Supabase, com controle de acesso por empresa
        (Row Level Security) — cada estabelecimento só enxerga os próprios dados.
      </Text>

      <Text className="mb-2 text-base font-semibold text-gray-900">Seus direitos (LGPD)</Text>
      <Text className="mb-4 text-base leading-6 text-gray-700">
        Você pode acessar, corrigir ou excluir seus dados a qualquer momento. A exclusão de conta
        (tela de Perfil) apaga permanentemente seu usuário, seu estabelecimento e todo o conteúdo
        associado — inclusive fotos — de forma irreversível.
      </Text>

      <Text className="mb-8 text-base leading-6 text-gray-700">
        Dúvidas sobre privacidade podem ser encaminhadas para o suporte do estabelecimento responsável
        pelo App.
      </Text>

      <PrimaryButton label="Voltar" variant="outline" onPress={() => router.back()} />
    </ScrollView>
  );
}
