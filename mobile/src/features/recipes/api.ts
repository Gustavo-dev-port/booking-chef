import { supabase } from '../../lib/supabase';
import type { IngredientRowInput, RecipeInput, RecipeType } from '../../validators/recipe';
import { reconcileIngredients } from './reconciliation';

export type RecipeSummary = {
  id: string;
  name: string;
  category: string | null;
  type: RecipeType;
  photo_path: string | null;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
};

export type RecipeDetail = RecipeSummary & {
  yield_amount: string | null;
  glass_type: string | null;
  garnish: string | null;
  final_weight: string | null;
  instructions: string | null;
  notes: string | null;
  ingredients: RecipeIngredient[];
};

const SUMMARY_COLUMNS = 'id, name, category, type, photo_path, updated_at';
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, yield_amount, glass_type, garnish, final_weight, instructions, notes`;

export async function listRecipes(companyId: string, type: RecipeType): Promise<RecipeSummary[]> {
  const { data, error } = await supabase
    .from('products')
    .select(SUMMARY_COLUMNS)
    .eq('company_id', companyId)
    .eq('type', type)
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return (data ?? []) as RecipeSummary[];
}

export async function listRecentRecipes(companyId: string, limit: number): Promise<RecipeSummary[]> {
  const { data, error } = await supabase
    .from('products')
    .select(SUMMARY_COLUMNS)
    .eq('company_id', companyId)
    .in('type', ['bar', 'cozinha'])
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as RecipeSummary[];
}

export async function getRecipe(id: string): Promise<RecipeDetail | null> {
  const [{ data: product, error: productError }, { data: ingredients, error: ingredientsError }] =
    await Promise.all([
      supabase.from('products').select(DETAIL_COLUMNS).eq('id', id).maybeSingle(),
      supabase
        .from('product_ingredients')
        .select('id, ingredient_name, quantity, unit')
        .eq('product_id', id),
    ]);
  if (productError) throw new Error(productError.message);
  if (ingredientsError) throw new Error(ingredientsError.message);
  if (!product) return null;

  return {
    ...(product as Omit<RecipeDetail, 'ingredients'>),
    ingredients: (ingredients ?? []) as RecipeIngredient[],
  };
}

async function replaceIngredients(companyId: string, productId: string, rows: IngredientRowInput[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('product_ingredients')
    .delete()
    .eq('product_id', productId);
  if (deleteError) throw new Error(deleteError.message);

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from('product_ingredients').insert(
    rows.map((row) => ({
      product_id: productId,
      ingredient_name: row.ingredientName,
      quantity: row.quantity,
      unit: row.unit,
    }))
  );
  if (insertError) throw new Error(insertError.message);

  // Fase 8 — conciliação de insumos (best-effort: não trava o salvamento
  // da ficha se falhar). Ver src/features/recipes/reconciliation.ts.
  await reconcileIngredients(companyId, productId, rows);
}

function toProductRow(input: RecipeInput) {
  return {
    name: input.name,
    category: input.category || null,
    yield_amount: input.yieldAmount || null,
    glass_type: input.glassType || null,
    garnish: input.garnish || null,
    final_weight: input.finalWeight || null,
    instructions: input.instructions || null,
    notes: input.notes || null,
  };
}

/** @returns o id do novo produto. */
export async function createRecipe(companyId: string, type: RecipeType, input: RecipeInput): Promise<string> {
  const { data, error } = await supabase
    .from('products')
    // sale_price é NOT NULL na tabela (campo do cardápio digital) — ficha
    // técnica não pede preço de venda na v0.0.1, então grava 0.
    .insert({ ...toProductRow(input), company_id: companyId, type, sale_price: 0 })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  await replaceIngredients(companyId, data.id, input.ingredients);
  return data.id;
}

export async function updateRecipe(companyId: string, id: string, input: RecipeInput): Promise<void> {
  const { error } = await supabase.from('products').update(toProductRow(input)).eq('id', id);
  if (error) throw new Error(error.message);

  await replaceIngredients(companyId, id, input.ingredients);
}

export async function setRecipePhoto(id: string, photoPath: string): Promise<void> {
  const { error } = await supabase.from('products').update({ photo_path: photoPath }).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Soft delete — nunca apagar fisicamente (ver FASE1-ARQUITETURA.md, "Exclusão lógica"). */
export async function archiveRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
  if (error) throw new Error(error.message);
}
