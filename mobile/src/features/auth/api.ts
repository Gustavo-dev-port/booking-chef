import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { normalizeCnpj } from '../../validators/cnpj';
import type { OnboardingInput } from '../../validators/onboarding';

/** Mensagens conhecidas do Supabase Auth / Postgres, traduzidas para o usuário. */
const KNOWN_ERRORS: Array<[string, string]> = [
  ['Invalid login credentials', 'Email ou senha incorretos.'],
  ['User already registered', 'Já existe uma conta com esse email.'],
  ['Email not confirmed', 'Confirme seu email antes de entrar.'],
  ['Password should be at least', 'A senha é muito curta.'],
  ['companies_cnpj_unique', 'Já existe uma empresa cadastrada com esse CNPJ.'],
  ['companies_cnpj_digits_check', 'CNPJ inválido.'],
];

function translateError(message: string): string {
  const match = KNOWN_ERRORS.find(([needle]) => message.includes(needle));
  return match ? match[1] : message;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateError(error.message));
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** @returns true se precisa confirmar o email antes de conseguir logar. */
export async function signUp(email: string, password: string): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: Linking.createURL('login') },
  });
  if (error) throw new Error(translateError(error.message));
  return { needsEmailConfirmation: !data.session };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Linking.createURL('reset-password'),
  });
  if (error) throw new Error(translateError(error.message));
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(translateError(error.message));
}

/**
 * Exclusão de conta (LGPD, direito de eliminação) — chama a Edge Function
 * `delete-account`, que apaga a empresa (em cascata: fichas, insumos,
 * fotos) e o próprio usuário no Supabase Auth. `functions.invoke` já
 * manda o token da sessão atual como Authorization — o usuário-alvo é
 * sempre resolvido no servidor a partir desse token, nunca informado pelo
 * client.
 */
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw new Error('Não foi possível excluir a conta. Tente novamente.');
  if (data?.error) throw new Error(data.error);
}

/**
 * Onboarding completo: grava o perfil e cria a empresa vinculando o usuário
 * como dono. A criação da empresa passa exclusivamente por
 * `create_company_with_owner` (RPC já existente no banco, SECURITY DEFINER)
 * — não existe INSERT direto liberado em `companies`/`company_users`, de
 * propósito (ver histórico de segurança nas migrations do projeto).
 */
export async function completeOnboarding(
  userId: string,
  email: string,
  input: OnboardingInput
): Promise<void> {
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    name: input.name,
    email,
    phone: input.phone || null,
    terms_accepted_at: new Date().toISOString(),
    marketing_opt_in: input.marketingOptIn,
  });
  if (profileError) throw new Error(translateError(profileError.message));

  const { error: companyError } = await supabase.rpc('create_company_with_owner', {
    p_cnpj: normalizeCnpj(input.cnpj),
    p_legal_name: input.legalName,
    p_trade_name: input.tradeName || null,
    p_segment: input.segment,
    p_employee_range: input.employeeRange,
    p_city: input.city,
    p_state: input.state,
  });
  if (companyError) throw new Error(translateError(companyError.message));
}
