import type { RecipeIngredient } from '../recipes/api';

export type ConsumptionPreviewRow = {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  required: number;
  available: number;
  insufficient: boolean;
};

/**
 * Prévia de consumo (V3, Épico 09, história 09.3) — lógica pura, sem
 * `supabase`, mesmo motivo de cmv.ts/stockStatus.ts (testável sem mockar
 * nada). Só considera ingredientes vinculados ao estoque (`ingredient_id`
 * preenchido) — texto livre não tem saldo pra checar, mesma regra que
 * register_production() aplica no banco na hora de fato baixar o estoque.
 */
export function computeConsumptionPreview(
  ingredients: RecipeIngredient[],
  quantityProduced: number,
  currentQuantityById: Map<string, number>
): ConsumptionPreviewRow[] {
  if (!Number.isFinite(quantityProduced) || quantityProduced <= 0) return [];

  return ingredients
    .filter((row) => !!row.ingredient_id)
    .map((row) => {
      const ingredientId = row.ingredient_id as string;
      const available = currentQuantityById.get(ingredientId) ?? 0;
      const required = row.quantity * quantityProduced;
      return {
        ingredientId,
        ingredientName: row.ingredient_name,
        unit: row.unit,
        required,
        available,
        insufficient: required > available,
      };
    });
}

export function hasInsufficientStock(rows: ConsumptionPreviewRow[]): boolean {
  return rows.some((row) => row.insufficient);
}
