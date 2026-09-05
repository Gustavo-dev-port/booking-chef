import { supabase } from '../../lib/supabase';
import type { InventoryItemInput } from '../../validators/inventory';

export type NamedOption = { id: string; name: string };

export type InventoryItem = {
  id: string;
  name: string;
  category_id: string | null;
  purchase_unit: string;
  usage_unit: string;
  package_content: number;
  package_price: number;
  unit_cost: number | null;
  current_quantity: number;
  minimum_quantity: number;
  internal_code: string | null;
  barcode: string | null;
  supplier_id: string | null;
};

const ITEM_COLUMNS =
  'id, name, category_id, purchase_unit, usage_unit, package_content, package_price, unit_cost, current_quantity, minimum_quantity, internal_code, barcode, supplier_id';

/**
 * Estoque (V2, Épico 06) estende `ingredients` em vez de nascer como
 * tabela paralela — decisão de arquitetura em docs/07_DATABASE.md,
 * confirmada com o usuário. Quantidade de compra e volume de uso são
 * campos distintos (purchase_unit/package_content/package_price vs.
 * usage_unit) — ver comentário em src/validators/inventory.ts.
 * `current_quantity`/`minimum_quantity` (e as movimentações, ver
 * movements.ts) ficam sempre em usage_unit — é a unidade que a receita
 * consome e que o CMV usa pra custo.
 */
export async function listInventoryItems(companyId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select(ITEM_COLUMNS)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as InventoryItem[];
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase.from('ingredients').select(ITEM_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as InventoryItem | null;
}

function toIngredientRow(input: InventoryItemInput) {
  return {
    name: input.name,
    category_id: input.categoryId || null,
    purchase_unit: input.purchaseUnit,
    usage_unit: input.usageUnit,
    package_content: input.packageContent,
    package_price: input.packagePrice,
    minimum_quantity: input.minimumQuantity,
    supplier_id: input.supplierId || null,
    internal_code: input.internalCode || null,
    barcode: input.barcode || null,
  };
}

export async function createInventoryItem(companyId: string, input: InventoryItemInput): Promise<string> {
  const { data, error } = await supabase
    .from('ingredients')
    .insert({ ...toIngredientRow(input), company_id: companyId })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateInventoryItem(id: string, input: InventoryItemInput): Promise<void> {
  const { error } = await supabase.from('ingredients').update(toIngredientRow(input)).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Soft delete — nunca apagar fisicamente (docs/07_DATABASE.md, §1). */
export async function archiveInventoryItem(id: string): Promise<void> {
  const { error } = await supabase.from('ingredients').update({ is_active: false }).eq('id', id);
  if (error) throw new Error(error.message);
}

// Categorias e fornecedores — mesmo padrão "achar ou criar" já usado na
// conciliação de insumos (Fase 8): sem tela dedicada de cadastro ainda,
// só criação inline a partir do formulário de insumo.

export async function listCategories(companyId: string): Promise<NamedOption[]> {
  const { data, error } = await supabase
    .from('ingredient_categories')
    .select('id, name')
    .eq('company_id', companyId)
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(companyId: string, name: string): Promise<NamedOption> {
  const { data, error } = await supabase
    .from('ingredient_categories')
    .insert({ company_id: companyId, name })
    .select('id, name')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listSuppliers(companyId: string): Promise<NamedOption[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSupplier(companyId: string, name: string): Promise<NamedOption> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({ company_id: companyId, name })
    .select('id, name')
    .single();
  if (error) throw new Error(error.message);
  return data;
}
