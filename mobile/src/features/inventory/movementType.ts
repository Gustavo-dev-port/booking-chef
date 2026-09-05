/**
 * Tipos de movimentação (V2, Épico 06, história 06.2). `producao` existe
 * no CHECK constraint do banco (reservado pro Épico 09, V3) mas não é
 * selecionável aqui — não existe fluxo de produção ainda.
 *
 * Fica num arquivo próprio, sem importar `supabase`, de propósito: é
 * lógica pura, testável sem precisar mockar o cliente Supabase nem
 * variáveis de ambiente (mesmo motivo de src/features/recipes/ingredientName.ts).
 */
export const MOVEMENT_TYPES = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'ajuste', label: 'Ajuste (contagem)' },
  { value: 'perda', label: 'Perda' },
] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number]['value'];

export function movementTypeLabel(type: string): string {
  return MOVEMENT_TYPES.find((t) => t.value === type)?.label ?? type;
}
