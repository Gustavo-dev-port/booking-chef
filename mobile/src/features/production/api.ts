import { supabase } from '../../lib/supabase';

export type Production = {
  id: string;
  product_id: string;
  quantity_produced: number;
  produced_by: string;
  produced_at: string;
  notes: string | null;
};

/**
 * Único caminho de escrita — chama `register_production` (SECURITY
 * DEFINER, atômica: valida o saldo de TODOS os insumos vinculados da
 * ficha antes de escrever qualquer baixa — tudo-ou-nada, ver migration
 * `v3_sprint6_productions`). Nunca um INSERT direto: não existe policy
 * de INSERT em `productions` de propósito, mesmo padrão de
 * `inventory_movements`/`employees` (docs/07_DATABASE.md §4).
 */
export async function registerProduction(
  productId: string,
  quantityProduced: number,
  notes?: string
): Promise<Production> {
  const { data, error } = await supabase.rpc('register_production', {
    p_product_id: productId,
    p_quantity_produced: quantityProduced,
    p_notes: notes || null,
  });
  if (error) throw new Error(error.message);
  return data as Production;
}

export async function listProductions(productId: string): Promise<Production[]> {
  const { data, error } = await supabase
    .from('productions')
    .select('id, product_id, quantity_produced, produced_by, produced_at, notes')
    .eq('product_id', productId)
    .order('produced_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
