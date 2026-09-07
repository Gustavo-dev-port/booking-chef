import { supabase } from '../../lib/supabase';
import type { EmployeeInviteInput } from '../../validators/team';

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
};

/**
 * Remoção de acesso (V2, Épico 08, história 08.4) — só o proprietário
 * consegue (RLS de employees_update), e é sempre soft: status='removido',
 * nunca apaga a linha. Fichas técnicas e movimentações que essa pessoa
 * criou continuam no histórico (created_by/invited_by nunca mudam).
 */
export async function removeEmployeeAccess(id: string): Promise<void> {
  const { error } = await supabase.from('employees').update({ status: 'removido' }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listEmployees(companyId: string): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, email, role, status, invited_at')
    .eq('company_id', companyId)
    .order('invited_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Único caminho de escrita — chama a Edge Function `invite-employee`
 * (service role), nunca um INSERT direto (não existe policy de INSERT em
 * `employees` de propósito, ver migration
 * v2_sprint4_employees_no_direct_insert). Ela checa que quem chama é
 * proprietário, barra convite duplicado e só grava a linha depois de
 * mandar o convite de verdade pelo Supabase Auth.
 */
export async function inviteEmployee(input: EmployeeInviteInput): Promise<Employee> {
  const { data, error } = await supabase.functions.invoke('invite-employee', {
    method: 'POST',
    body: input,
  });
  if (error) {
    // supabase-js só expõe o corpo do erro em error.context pra respostas
    // não-2xx de Edge Function — sem isso, cai numa mensagem genérica.
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = await context.clone().json();
        if (body?.error) throw new Error(body.error);
      } catch {
        // corpo não era JSON — segue pro throw genérico abaixo.
      }
    }
    throw new Error('Não foi possível convidar. Tente novamente.');
  }
  if (data?.error) throw new Error(data.error);
  return data.employee as Employee;
}

/**
 * Ativa o convite (V2, Épico 08, história 08.2) — chamado pela tela
 * app/accept-invite.tsx depois de `updatePassword`. Cria o profile (não
 * existe ainda pra quem entrou por convite, só onboarding cria) e chama
 * a RPC `accept_employee_invite` (SECURITY DEFINER — vincula
 * `employees.user_id`/status='ativo', RLS bloquearia um UPDATE direto
 * porque quem convida ainda não é "membro" da empresa).
 */
export async function acceptEmployeeInvite(userId: string, email: string, name: string): Promise<void> {
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    name,
    email,
    terms_accepted_at: new Date().toISOString(),
    marketing_opt_in: false,
  });
  if (profileError) throw new Error(profileError.message);

  const { error: rpcError } = await supabase.rpc('accept_employee_invite');
  if (rpcError) {
    // Idempotência: se uma tentativa anterior já tinha ativado o convite
    // e só falhou depois (ex.: no upsert do profile, numa retentativa),
    // a RPC erra de novo porque não há mais convite "pendente" — mas aí
    // já está tudo certo, não é uma falha de verdade.
    const { data: alreadyActive } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'ativo')
      .maybeSingle();
    if (!alreadyActive) {
      throw new Error('Não foi possível ativar seu acesso. Confira se o link do convite ainda é válido.');
    }
  }
}
