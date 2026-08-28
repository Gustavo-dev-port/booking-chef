import { z } from 'zod';

export const RECIPE_TYPES = ['bar', 'cozinha'] as const;
export type RecipeType = (typeof RECIPE_TYPES)[number];

export function isRecipeType(value: string): value is RecipeType {
  return (RECIPE_TYPES as readonly string[]).includes(value);
}

/**
 * Unidades de medida padronizadas (pedido do usuário: padrão brasileiro
 * de cozinha/bar) — fecha o que era um campo 100% texto livre na Fase 4.
 * `ingredient_name` continua texto livre; só `unit` virou uma lista
 * fechada. Ficha antiga com unidade fora dessa lista (texto livre de
 * antes) continua existindo no banco, só passa a exigir escolher uma
 * dessas 5 opções na próxima edição.
 */
export const INGREDIENT_UNITS = [
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'L' },
  { value: 'ml', label: 'mL' },
  { value: 'un', label: 'Un' },
] as const;
export type IngredientUnit = (typeof INGREDIENT_UNITS)[number]['value'];

const ingredientUnitValues = INGREDIENT_UNITS.map((u) => u.value) as [IngredientUnit, ...IngredientUnit[]];

export function ingredientUnitLabel(value: string): string {
  return INGREDIENT_UNITS.find((u) => u.value === value)?.label ?? value;
}

/**
 * Ingrediente 100% texto livre pro nome (v0.0.1 — ver
 * FASE1-ARQUITETURA-MOBILE.md seção 4): sem busca, sem catálogo.
 * `quantity` precisa ser número de verdade porque
 * `product_ingredients.quantity` no banco é `numeric`.
 */
export const ingredientRowSchema = z.object({
  ingredientName: z.string().trim().min(1, 'Informe o ingrediente'),
  quantity: z.coerce.number({ error: 'Informe a quantidade' }).nonnegative('Deve ser 0 ou mais'),
  unit: z.enum(ingredientUnitValues, { error: 'Escolha a unidade' }),
});
export type IngredientRowInput = z.infer<typeof ingredientRowSchema>;

/**
 * Campos comuns a bar e cozinha, mais os condicionais (copo/decoração só
 * bar; peso final só cozinha) — a tela de edição decide quais mostrar
 * conforme o `type`, mas os dois conjuntos ficam sempre no schema pra não
 * precisar de dois schemas quase iguais.
 */
export const recipeSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  category: z.string().trim().optional(),
  yieldAmount: z.string().trim().optional(),
  glassType: z.string().trim().optional(),
  garnish: z.string().trim().optional(),
  finalWeight: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  ingredients: z.array(ingredientRowSchema),
});
/** Tipo depois da validação (quantity já é number) — usado pelas funções de API. */
export type RecipeInput = z.infer<typeof recipeSchema>;
/** Tipo do formulário antes da validação (quantity ainda é o que o TextInput manda) — usado no useForm. */
export type RecipeFormValues = z.input<typeof recipeSchema>;

export const RECIPE_TYPE_LABELS: Record<RecipeType, string> = {
  bar: 'Bar',
  cozinha: 'Cozinha',
};
