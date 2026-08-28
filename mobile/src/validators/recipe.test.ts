import { ingredientRowSchema, ingredientUnitLabel, isRecipeType, recipeSchema } from './recipe';

describe('isRecipeType', () => {
  it('aceita só "bar" e "cozinha"', () => {
    expect(isRecipeType('bar')).toBe(true);
    expect(isRecipeType('cozinha')).toBe(true);
    expect(isRecipeType('estoque')).toBe(false);
    expect(isRecipeType('')).toBe(false);
  });
});

describe('ingredientUnitLabel', () => {
  it('traduz o código pro rótulo em pt-BR', () => {
    expect(ingredientUnitLabel('kg')).toBe('Kg');
    expect(ingredientUnitLabel('ml')).toBe('mL');
    expect(ingredientUnitLabel('un')).toBe('Un');
  });

  it('devolve o próprio valor se não reconhecer (ficha antiga com texto livre)', () => {
    expect(ingredientUnitLabel('unidade')).toBe('unidade');
  });
});

describe('ingredientRowSchema', () => {
  it('converte a quantidade digitada (string) pra number', () => {
    const result = ingredientRowSchema.parse({ ingredientName: 'Limão', quantity: '2.5', unit: 'ml' });
    expect(result.quantity).toBe(2.5);
    expect(typeof result.quantity).toBe('number');
  });

  it('rejeita quantidade negativa', () => {
    expect(ingredientRowSchema.safeParse({ ingredientName: 'Limão', quantity: -1, unit: 'un' }).success).toBe(
      false
    );
  });

  it('rejeita ingrediente sem nome', () => {
    expect(ingredientRowSchema.safeParse({ ingredientName: '', quantity: 1, unit: 'un' }).success).toBe(false);
  });

  it('rejeita unidade fora da lista fechada (Kg/g/L/mL/Un)', () => {
    expect(
      ingredientRowSchema.safeParse({ ingredientName: 'Limão', quantity: 1, unit: 'unidade' }).success
    ).toBe(false);
    expect(
      ingredientRowSchema.safeParse({ ingredientName: 'Limão', quantity: 1, unit: 'colher' }).success
    ).toBe(false);
  });

  it('aceita as 5 unidades padronizadas', () => {
    for (const unit of ['kg', 'g', 'l', 'ml', 'un']) {
      expect(ingredientRowSchema.safeParse({ ingredientName: 'Limão', quantity: 1, unit }).success).toBe(true);
    }
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
    ingredients: [{ ingredientName: 'Limão', quantity: '1', unit: 'un' }],
  };

  it('aceita uma ficha válida', () => {
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
