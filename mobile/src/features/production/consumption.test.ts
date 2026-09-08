import { computeConsumptionPreview, hasInsufficientStock } from './consumption';
import type { RecipeIngredient } from '../recipes/api';

function ingredient(overrides: Partial<RecipeIngredient> = {}): RecipeIngredient {
  return {
    id: 'row-1',
    ingredient_name: 'Cachaça',
    quantity: 50,
    unit: 'ml',
    ingredient_id: 'ing-1',
    ...overrides,
  };
}

describe('computeConsumptionPreview', () => {
  it('quantidade zero ou inválida não gera prévia nenhuma', () => {
    expect(computeConsumptionPreview([ingredient()], 0, new Map())).toEqual([]);
    expect(computeConsumptionPreview([ingredient()], NaN, new Map())).toEqual([]);
    expect(computeConsumptionPreview([ingredient()], -2, new Map())).toEqual([]);
  });

  it('ignora ingrediente em texto livre (sem ingredient_id)', () => {
    const rows = computeConsumptionPreview(
      [ingredient({ ingredient_id: null })],
      2,
      new Map([['ing-1', 1000]])
    );
    expect(rows).toEqual([]);
  });

  it('calcula quantidade requerida como quantidade da receita × quantidade produzida', () => {
    const rows = computeConsumptionPreview([ingredient({ quantity: 50 })], 3, new Map([['ing-1', 1000]]));
    expect(rows).toEqual([
      {
        ingredientId: 'ing-1',
        ingredientName: 'Cachaça',
        unit: 'ml',
        required: 150,
        available: 1000,
        insufficient: false,
      },
    ]);
  });

  it('marca insufficient quando o requerido excede o saldo atual', () => {
    const rows = computeConsumptionPreview([ingredient({ quantity: 50 })], 30, new Map([['ing-1', 1000]]));
    expect(rows[0].insufficient).toBe(true);
  });

  it('insumo sem saldo cadastrado no mapa é tratado como 0 disponível', () => {
    const rows = computeConsumptionPreview([ingredient()], 1, new Map());
    expect(rows[0].available).toBe(0);
    expect(rows[0].insufficient).toBe(true);
  });
});

describe('hasInsufficientStock', () => {
  it('false quando nenhuma linha está insuficiente', () => {
    expect(
      hasInsufficientStock([
        { ingredientId: 'a', ingredientName: 'A', unit: 'ml', required: 10, available: 20, insufficient: false },
      ])
    ).toBe(false);
  });

  it('true quando pelo menos uma linha está insuficiente', () => {
    expect(
      hasInsufficientStock([
        { ingredientId: 'a', ingredientName: 'A', unit: 'ml', required: 10, available: 20, insufficient: false },
        { ingredientId: 'b', ingredientName: 'B', unit: 'un', required: 5, available: 2, insufficient: true },
      ])
    ).toBe(true);
  });
});
