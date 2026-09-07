import { supabase } from '../../lib/supabase';
import type { CmvSummary } from './cmv';

export type RecipeCostSnapshot = {
  id: string;
  total_cost: number;
  cost_per_portion: number | null;
  cmv_percentage: number | null;
  sale_price_at_snapshot: number | null;
  calculated_at: string;
};

/**
 * Grava um snapshot de custo/CMV (V2, Épico 07, história 07.3) — chamado
 * a cada salvamento da ficha (ver app/(app)/recipes/[type]/[id].tsx).
 * Nunca falha o salvamento da ficha por causa disso — best-effort, mesmo
 * princípio da reconciliação de insumos (Fase 8): registrar histórico é
 * importante, mas não pode travar o fluxo principal (salvar a ficha).
 *
 * `costPerPortion` fica de fora por enquanto: exigiria interpretar
 * `yield_amount` (hoje texto livre, ex. "6 porções" ou "1 garrafa de
 * 750ml") como um número — fora de escopo desta história.
 */
export async function saveCostSnapshot(productId: string, summary: CmvSummary, salePrice: number | undefined): Promise<void> {
  try {
    const { error } = await supabase.from('recipe_cost_snapshot').insert({
      product_id: productId,
      total_cost: summary.totalCost,
      cmv_percentage: summary.cmvPercentage,
      sale_price_at_snapshot: salePrice ?? null,
    });
    if (error) console.error('Falha ao gravar snapshot de custo:', error.message);
  } catch (error) {
    console.error('Falha ao gravar snapshot de custo:', error);
  }
}

export async function listCostSnapshots(productId: string): Promise<RecipeCostSnapshot[]> {
  const { data, error } = await supabase
    .from('recipe_cost_snapshot')
    .select('id, total_cost, cost_per_portion, cmv_percentage, sale_price_at_snapshot, calculated_at')
    .eq('product_id', productId)
    .order('calculated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
