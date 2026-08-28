import { normalizeIngredientName } from './ingredientName';

describe('normalizeIngredientName', () => {
  it('ignora maiúsculas/minúsculas', () => {
    expect(normalizeIngredientName('LIMÃO')).toBe(normalizeIngredientName('limão'));
  });

  it('ignora espaço nas pontas', () => {
    expect(normalizeIngredientName('  Limão  ')).toBe(normalizeIngredientName('Limão'));
  });

  it('ignora acento', () => {
    expect(normalizeIngredientName('Limao')).toBe(normalizeIngredientName('Limão'));
  });

  it('colapsa espaços internos repetidos', () => {
    expect(normalizeIngredientName('Suco   de   limão')).toBe(normalizeIngredientName('Suco de limão'));
  });

  it('não junta insumos diferentes só porque o nome é parecido', () => {
    expect(normalizeIngredientName('Limão')).not.toBe(normalizeIngredientName('Limão siciliano'));
    expect(normalizeIngredientName('Limão')).not.toBe(normalizeIngredientName('Laranja'));
  });
});
