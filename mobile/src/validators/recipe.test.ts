import { ingredientRowSchema, isRecipeType, recipeSchema } from './recipe';

describe('isRecipeType', () => {
  it('aceita só "bar" e "cozinha"', () => {
    expect(isRecipeType('bar')).toBe(true);
    expect(isRecipeType('cozinha')).toBe(true);
    expect(isRecipeType('estoque')).toBe(false);
    expect(isRecipeType('')).toBe(false);
  });
});

describe('ingredientRowSchema', () => {
  it('converte a quantidade digitada (string) pra number', () => {
    const result = ingredientRowSchema.parse({ ingredientName: 'Limão', quantity: '2.5', unit: 'unidade' });
    expect(result.quantity).toBe(2.5);
    expect(typeof result.quantity).toBe('number');
  });

  it('rejeita quantidade negativa', () => {
    expect(
      ingredientRowSchema.safeParse({ ingredientName: 'Limão', quantity: -1, unit: 'unidade' }).success
    ).toBe(false);
  });

  it('rejeita ingrediente sem nome', () => {
    expect(
      ingredientRowSchema.safeParse({ ingredientName: '', quantity: 1, unit: 'unidade' }).success
    ).toBe(false);
  });
});

describe('recipeSchema', () => {
  const base = {
    name: 'Caipirinha',
    category: 'Clássicos',
    yieldAmount: '1 dose',
    glassType: 'Copo baixo',
    garnish: 'Limão',
    finalWeight: '',
    instructions: 'Bata tudo.',
    notes: '',
    ingredients: [{ ingredientName: 'Limão', quantity: '1', unit: 'unidade' }],
  };

  it('aceita uma ficha válida, com ingredientes texto livre', () => {
    expect(recipeSchema.safeParse(base).success).toBe(true);
  });

  it('aceita ficha sem nenhum ingrediente ainda (rascunho)', () => {
    expect(recipeSchema.safeParse({ ...base, ingredients: [] }).success).toBe(true);
  });

  it('exige nome da ficha', () => {
    expect(recipeSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });

  it('todos os campos além de nome e ingredientes são opcionais', () => {
    const minimal = { name: 'Água com gás', ingredients: [] };
    expect(recipeSchema.safeParse(minimal).success).toBe(true);
  });
});
