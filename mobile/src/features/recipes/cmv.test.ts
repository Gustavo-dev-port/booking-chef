import { calculateCmv } from './cmv';

describe('calculateCmv', () => {
  const costById = new Map([
    ['cachaca', 0.15],
    ['limao', 1.5],
  ]);

  it('soma custo só das linhas vinculadas ao estoque', () => {
    const result = calculateCmv(
      [
        { ingredientId: 'cachaca', quantity: 50 },
        { ingredientId: 'limao', quantity: 1 },
      ],
      costById,
      undefined
    );
    expect(result.totalCost).toBeCloseTo(50 * 0.15 + 1 * 1.5);
    expect(result.hasUnknownCost).toBe(false);
  });

  it('marca hasUnknownCost quando alguma linha é texto livre (sem vínculo)', () => {
    const result = calculateCmv(
      [{ ingredientId: 'cachaca', quantity: 50 }, { quantity: 1 }],
      costById,
      undefined
    );
    expect(result.hasUnknownCost).toBe(true);
    // custo desconhecido não entra na soma, mas o que é conhecido continua contando
    expect(result.totalCost).toBeCloseTo(50 * 0.15);
  });

  it('CMV% e margem ficam null sem preço de venda', () => {
    const result = calculateCmv([{ ingredientId: 'cachaca', quantity: 50 }], costById, undefined);
    expect(result.cmvPercentage).toBeNull();
    expect(result.grossMargin).toBeNull();
  });

  it('calcula CMV% e margem corretamente com preço de venda', () => {
    const result = calculateCmv([{ ingredientId: 'cachaca', quantity: 50 }], costById, 15);
    // custo = 7.5, preço = 15 -> CMV% = 50%, margem = 7.5
    expect(result.totalCost).toBeCloseTo(7.5);
    expect(result.cmvPercentage).toBeCloseTo(50);
    expect(result.grossMargin).toBeCloseTo(7.5);
  });

  it('trata preço de venda 0 como "sem preço" (evita divisão por zero)', () => {
    const result = calculateCmv([{ ingredientId: 'cachaca', quantity: 50 }], costById, 0);
    expect(result.cmvPercentage).toBeNull();
  });

  it('ficha sem ingredientes dá custo 0 sem marcar hasUnknownCost', () => {
    const result = calculateCmv([], costById, 10);
    expect(result.totalCost).toBe(0);
    expect(result.hasUnknownCost).toBe(false);
  });
});
