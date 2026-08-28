import { supabase } from '../../lib/supabase';
import type { RecipeType } from '../../validators/recipe';

export type BookingIngredient = { ingredient_name: string; quantity: number; unit: string };

export type BookingRecipe = {
  id: string;
  name: string;
  category: string | null;
  type: RecipeType;
  photo_path: string | null;
  yield_amount: string | null;
  glass_type: string | null;
  garnish: string | null;
  final_weight: string | null;
  instructions: string | null;
  notes: string | null;
  ingredients: BookingIngredient[];
};

export async function getCompanyName(companyId: string): Promise<string> {
  const { data, error } = await supabase
    .from('companies')
    .select('trade_name, legal_name')
    .eq('id', companyId)
    .single();
  if (error) throw new Error(error.message);
  return data.trade_name || data.legal_name;
}

/**
 * Busca tudo que o PDF precisa (ficha + ingredientes) em 2 queries, não
 * N+1 — uma pra `products`, outra pra `product_ingredients` de todos os
 * produtos encontrados, agrupada em memória.
 */
export async function listRecipesForBooking(companyId: string, types: RecipeType[]): Promise<BookingRecipe[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select(
      'id, name, category, type, photo_path, yield_amount, glass_type, garnish, final_weight, instructions, notes'
    )
    .eq('company_id', companyId)
    .in('type', types)
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  if (!products || products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const { data: ingredientRows, error: ingredientsError } = await supabase
    .from('product_ingredients')
    .select('product_id, ingredient_name, quantity, unit')
    .in('product_id', ids);
  if (ingredientsError) throw new Error(ingredientsError.message);

  const byProduct = new Map<string, BookingIngredient[]>();
  for (const row of ingredientRows ?? []) {
    const list = byProduct.get(row.product_id) ?? [];
    list.push({ ingredient_name: row.ingredient_name ?? '', quantity: row.quantity, unit: row.unit });
    byProduct.set(row.product_id, list);
  }

  return products.map((p) => ({
    ...(p as Omit<BookingRecipe, 'ingredients'>),
    ingredients: byProduct.get(p.id) ?? [],
  }));
}
