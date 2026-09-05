/**
 * Cálculo de custo/CMV (V2, Épico 07, história 07.2) — lógica pura, sem
 * `supabase`, pra ficar testável e reutilizável tanto na tela de edição
 * (recalcula a cada tecla, via useWatch) quanto num futuro snapshot
 * (07.3, Sprint 4).
 */
export type CmvIngredientRow = {
  ingredientId?: string;
  quantity: number;
};

export type CmvSummary = {
  /** Soma de quantidade × custo unitário, só das linhas vinculadas ao estoque. */
  totalCost: number;
  /** true se alguma linha não tem custo conhecido (ingrediente texto livre) — o total pode estar incompleto. */
  hasUnknownCost: boolean;
  /** null quando não há preço de venda definido ainda — CMV% não faz sentido sem ele. */
  cmvPercentage: number | null;
  grossMargin: number | null;
};

export function calculateCmv(
  ingredients: CmvIngredientRow[],
  costById: Map<string, number>,
  salePrice: number | undefined
): CmvSummary {
  let totalCost = 0;
  let hasUnknownCost = false;

  for (const row of ingredients) {
    if (row.ingredientId && costById.has(row.ingredientId)) {
      totalCost += (costById.get(row.ingredientId) ?? 0) * (row.quantity || 0);
    } else {
      hasUnknownCost = true;
    }
  }

  const hasSalePrice = typeof salePrice === 'number' && salePrice > 0;

  return {
    totalCost,
    hasUnknownCost,
    cmvPercentage: hasSalePrice ? (totalCost / salePrice) * 100 : null,
    grossMargin: hasSalePrice ? salePrice - totalCost : null,
  };
}
