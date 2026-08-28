import { supabase } from '../../lib/supabase';
import type { IngredientRowInput } from '../../validators/recipe';
import { normalizeIngredientName } from './ingredientName';

/**
 * Fase 8 — Conciliação de insumos (ver FASE1-ARQUITETURA-MOBILE.md, seção
 * 4 e 9; e o comentário da coluna `ingredient_name` na migration
 * `recipe_fields_and_freeform_ingredients`).
 *
 * Ingrediente na ficha técnica é 100% texto livre (v0.0.1): o usuário
 * digita, sem busca nem catálogo. Isso preenche `ingredient_name` e deixa
 * `ingredient_id` nulo. Essa rotina roda depois de cada salvamento de
 * ficha e, pra cada nome digitado nessa ficha: casa com um insumo já
 * existente no catálogo `ingredients` da empresa (nome igual, ignorando
 * maiúsculas/acentos/espaço — ver normalizeIngredientName) e preenche
 * `ingredient_id`; se não existir, cadastra um insumo novo só com o nome
 * — sem preço/embalagem reais ainda (valores-placeholder neutros, a
 * serem completados depois pelo app web). `ingredient_name` nunca é
 * apagado: fica como registro do que a pessoa digitou de verdade.
 *
 * Match é por igualdade exata (normalizada), de propósito — não por
 * similaridade. "Limão" e "limão siciliano" são insumos diferentes; um
 * match "parecido" demais juntaria coisas erradas.
 */
export async function reconcileIngredients(
  companyId: string,
  productId: string,
  rows: IngredientRowInput[]
): Promise<void> {
  if (rows.length === 0) return;

  const { data: catalog, error: catalogError } = await supabase
    .from('ingredients')
    .select('id, name')
    .eq('company_id', companyId);
  if (catalogError) return;

  const idByNormalizedName = new Map<string, string>();
  for (const ingredient of (catalog ?? []) as Array<{ id: string; name: string }>) {
    idByNormalizedName.set(normalizeIngredientName(ingredient.name), ingredient.id);
  }

  const uniqueNames = Array.from(new Set(rows.map((row) => row.ingredientName)));

  for (const name of uniqueNames) {
    const key = normalizeIngredientName(name);
    if (idByNormalizedName.has(key)) continue;

    const { data: created, error: createError } = await supabase
      .from('ingredients')
      .insert({
        company_id: companyId,
        name: name.trim(),
        // Placeholder neutro — "só com o nome" (seção 4 do plano).
        // Preço/embalagem de verdade ficam pra quando alguém completar
        // esse insumo no app web.
        purchase_unit: 'unidade',
        usage_unit: 'unidade',
        package_content: 1,
        package_price: 0,
      })
      .select('id')
      .single();

    if (!createError && created) {
      idByNormalizedName.set(key, created.id);
    }
    // Erro aqui (ex.: corrida com outra ficha criando o mesmo insumo ao
    // mesmo tempo) não é fatal: essa linha só fica sem ingredient_id por
    // enquanto, e a próxima ficha salva tenta reconciliar de novo.
  }

  await Promise.all(
    uniqueNames.map((name) => {
      const id = idByNormalizedName.get(normalizeIngredientName(name));
      if (!id) return Promise.resolve();
      return supabase
        .from('product_ingredients')
        .update({ ingredient_id: id })
        .eq('product_id', productId)
        .eq('ingredient_name', name)
        .is('ingredient_id', null);
    })
  );
}
