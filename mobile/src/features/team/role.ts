/**
 * Cargos de convite de funcionário (V2, Épico 08, história 08.1). Fica
 * num arquivo próprio, sem importar `supabase`, de propósito — mesmo
 * motivo de src/features/recipes/ingredientName.ts.
 *
 * Enum PRÓPRIO, diferente de `company_users.role` (que tem
 * 'bartender_cozinha' — não dá pra diferenciar bar de cozinha). Isso é
 * de propósito: a história 08.3 (Sprint 5, restrição de acesso por
 * papel) precisa dessa granularidade pra dar a um bartender só a tela de
 * Bar e a um cozinheiro só a de Cozinha.
 *
 * 'proprietario' existe no CHECK constraint do banco (é o dono que já
 * existe desde a Fase 1) mas não é um cargo convidável por aqui — quem
 * cria a empresa já vira proprietário via create_company_with_owner.
 */
export const EMPLOYEE_ROLES = [
  { value: 'gerente', label: 'Gerente' },
  { value: 'bartender', label: 'Bartender' },
  { value: 'cozinheiro', label: 'Cozinheiro' },
  { value: 'visualizador', label: 'Visualizador' },
] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number]['value'];

export function employeeRoleLabel(value: string): string {
  return EMPLOYEE_ROLES.find((r) => r.value === value)?.label ?? value;
}

export const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  convidado: 'Convite pendente',
  ativo: 'Ativo',
  removido: 'Removido',
};

export function employeeStatusLabel(value: string): string {
  return EMPLOYEE_STATUS_LABELS[value] ?? value;
}
