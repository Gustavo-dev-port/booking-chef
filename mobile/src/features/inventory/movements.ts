import { supabase } from '../../lib/supabase';
import type { MovementType } from './movementType';

export type InventoryMovement = {
  id: string;
  item_id: string;
  type: string;
  quantity: number;
  reason: string | null;
  created_by: string;
  created_at: string;
};

/**
 * Único caminho de escrita — chama a função `register_inventory_movement`
 * (SECURITY DEFINER, atômica, com lock de linha), nunca um INSERT direto
 * (não existe policy de INSERT em `inventory_movements` de propósito). Pra
 * `ajuste`, `quantity` é o novo saldo total contado, não um delta — ver
 * comentário da migration `v2_sprint2_inventory_movements`.
 */
export async function registerMovement(
  itemId: string,
  type: MovementType,
  quantity: number,
  reason?: string
): Promise<InventoryMovement> {
  const { data, error } = await supabase.rpc('register_inventory_movement', {
    p_item_id: itemId,
    p_type: type,
    p_quantity: quantity,
    p_reason: reason || null,
  });
  if (error) throw new Error(error.message);
  return data as InventoryMovement;
}

export async function listMovements(itemId: string): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('id, item_id, type, quantity, reason, created_by, created_at')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
