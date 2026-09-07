import type { Membership } from '../auth/store';
import type { RecipeType } from '../../validators/recipe';

/**
 * Papel efetivo do usuário na empresa (V2, Épico 08, história 08.3) —
 * lógica pura, sem `supabase`, mesmo motivo de cmv.ts/pricing.ts.
 *
 * `Membership.role` mistura dois vocabulários diferentes de propósito
 * (ver docs/07_DATABASE.md e migration v2_sprint4_employees): quando
 * `is_owner` é true, `role` vem de `company_users` (sempre
 * 'proprietario' nesse caso — é quem criou a empresa). Quando não é
 * dono, `role` vem de `employees.role` (funcionário ativo — Sprint 5,
 * história 08.2), que usa o enum granular
 * gerente/bartender/cozinheiro/visualizador.
 */
export type AppRole = 'proprietario' | 'gerente' | 'bartender' | 'cozinheiro' | 'visualizador';

const EMPLOYEE_ROLE_VALUES: readonly string[] = ['gerente', 'bartender', 'cozinheiro', 'visualizador'];

export function resolveAppRole(membership: Membership | null): AppRole | null {
  if (!membership) return null;
  if (membership.is_owner) return 'proprietario';
  if (EMPLOYEE_ROLE_VALUES.includes(membership.role)) return membership.role as AppRole;
  // Não deveria acontecer na prática (só create_company_with_owner grava em
  // company_users, sempre com is_owner=true) — por segurança, trata como
  // 'gerente' (acesso amplo) em vez de travar a tela numa role desconhecida.
  return 'gerente';
}

/** Estoque e Equipe ficam visíveis só pra quem administra o negócio. */
export function canManageBusiness(role: AppRole | null): boolean {
  return role === 'proprietario' || role === 'gerente';
}

/** CMV, custo e calculadora de preço são dado financeiro — mesmo critério de Estoque/Equipe. */
export function canSeeFinancials(role: AppRole | null): boolean {
  return canManageBusiness(role);
}

/**
 * Bartender só acessa fichas de Bar; cozinheiro só as de Cozinha (história
 * 08.3, critério de aceite explícito). Os demais papéis veem os dois
 * módulos — visualizador só não pode ESCREVER (ver canWriteRecipes).
 */
export function canAccessRecipeType(role: AppRole | null, type: RecipeType): boolean {
  if (!role) return false;
  if (role === 'bartender') return type === 'bar';
  if (role === 'cozinheiro') return type === 'cozinha';
  return true; // proprietario, gerente, visualizador
}

export function canWriteRecipes(role: AppRole | null): boolean {
  return role !== null && role !== 'visualizador';
}
