import { z } from 'zod';

/**
 * Registro de produção (V3, Épico 09, história 09.1) — só a quantidade
 * produzida e uma observação opcional. O insumo/quantidade consumidos
 * não entram aqui: são calculados no banco a partir de `product_ingredients`
 * (ver register_production() e src/features/production/api.ts).
 */
export const productionSchema = z.object({
  quantityProduced: z.coerce
    .number({ error: 'Informe a quantidade produzida' })
    .positive('Deve ser maior que 0'),
  notes: z.string().trim().optional(),
});
/** Tipo depois da validação — usado pelas funções de API. */
export type ProductionInput = z.infer<typeof productionSchema>;
/** Tipo do formulário antes da validação — usado no useForm. */
export type ProductionFormValues = z.input<typeof productionSchema>;
