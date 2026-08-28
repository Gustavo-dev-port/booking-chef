/**
 * Tipos do domínio "ficha técnica" — espelham as colunas novas de `products` e
 * `product_ingredients` (migration `recipe_fields_and_freeform_ingredients`).
 * v0.0.1: ingrediente é 100% texto livre (ingredient_id fica de fora por enquanto).
 */

export type RecipeType = 'bar' | 'cozinha';

export type RecipeIngredient = {
  id: string;
  productId: string;
  /** Nome digitado livremente pelo usuário — v0.0.1 não usa o catálogo `ingredients`. */
  ingredientName: string;
  quantity: number;
  unit: string;
};

export type Recipe = {
  id: string;
  companyId: string;
  type: RecipeType | null;
  name: string;
  category: string | null;
  photoPath: string | null;
  yieldAmount: string | null;
  /** Só relevante quando type === 'bar'. */
  glassType: string | null;
  garnish: string | null;
  /** Só relevante quando type === 'cozinha'. */
  finalWeight: string | null;
  instructions: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
