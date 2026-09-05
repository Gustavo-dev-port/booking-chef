import { z } from 'zod';
import { INGREDIENT_UNITS } from './recipe';

const unitValues = INGREDIENT_UNITS.map((u) => u.value) as [string, ...string[]];

/**
 * Cadastro de insumo (V2, Épico 06 — Estoque, história 06.1). Estende
 * `ingredients` (decisão de arquitetura em docs/07_DATABASE.md) — o
 * formulário fica mais simples que o schema real: um "unidade" só, um
 * "preço" só. Isso é traduzido em purchase_unit = usage_unit = unit,
 * package_content = 1, package_price = pricePerUnit — matematicamente
 * unit_cost (gerado) vira exatamente o preço por unidade digitado (ver
 * src/features/inventory/api.ts).
 */
export const inventoryItemSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do insumo'),
  categoryId: z.string().trim().optional(),
  unit: z.enum(unitValues, { error: 'Escolha a unidade' }),
  pricePerUnit: z.coerce.number({ error: 'Informe o preço' }).nonnegative('Deve ser 0 ou mais'),
  minimumQuantity: z.coerce.number({ error: 'Informe a quantidade mínima' }).nonnegative('Deve ser 0 ou mais'),
  supplierId: z.string().trim().optional(),
  internalCode: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
});
/** Tipo depois da validação (números já são number) — usado pelas funções de API. */
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
/** Tipo do formulário antes da validação — usado no useForm. */
export type InventoryItemFormValues = z.input<typeof inventoryItemSchema>;
