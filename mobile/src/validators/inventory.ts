import { z } from 'zod';
import { INGREDIENT_UNITS } from './recipe';

const unitValues = INGREDIENT_UNITS.map((u) => u.value) as [string, ...string[]];

/**
 * Cadastro de insumo (V2, Épico 06 — Estoque, história 06.1). Estende
 * `ingredients` (decisão de arquitetura em docs/07_DATABASE.md).
 *
 * Quantidade e volume são coisas diferentes (pedido do usuário): uma
 * cachaça é COMPRADA em garrafa (`purchaseUnit`, ex. "Un") mas USADA na
 * receita em mL (`usageUnit`) — 1 garrafa tem 750 mL. `packageContent` é
 * esse "quantos [usageUnit] tem em 1 [purchaseUnit]" (750), e
 * `packagePrice` é o preço pago por 1 [purchaseUnit] (o preço da
 * garrafa). O banco já tinha essas 4 colunas desde a v0.0.1
 * (purchase_unit/usage_unit/package_content/package_price,
 * unit_cost = package_price/package_content é gerado) — o Sprint 1
 * simplificou pra purchaseUnit=usageUnit e packageContent=1 (1 preço,
 * 1 unidade); isso reabre os 4 campos de verdade.
 *
 * Quando compra e uso são a mesma unidade (ex. limão, "Un"), o dono só
 * deixa packageContent = 1 e os dois campos de unidade iguais — continua
 * funcionando exatamente como antes.
 */
export const inventoryItemSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do insumo'),
  categoryId: z.string().trim().optional(),
  purchaseUnit: z.enum(unitValues, { error: 'Escolha a unidade de compra' }),
  usageUnit: z.enum(unitValues, { error: 'Escolha a unidade de uso' }),
  packageContent: z.coerce
    .number({ error: 'Informe a quantidade' })
    .positive('Deve ser maior que 0'),
  packagePrice: z.coerce.number({ error: 'Informe o preço' }).nonnegative('Deve ser 0 ou mais'),
  minimumQuantity: z.coerce.number({ error: 'Informe a quantidade mínima' }).nonnegative('Deve ser 0 ou mais'),
  supplierId: z.string().trim().optional(),
  internalCode: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
});
/** Tipo depois da validação (números já são number) — usado pelas funções de API. */
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
/** Tipo do formulário antes da validação — usado no useForm. */
export type InventoryItemFormValues = z.input<typeof inventoryItemSchema>;
