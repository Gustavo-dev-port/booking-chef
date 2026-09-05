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
