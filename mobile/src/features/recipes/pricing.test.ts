import { suggestPrices } from './pricing';

describe('suggestPrices', () => {
  it('calcula os três preços a partir do custo e do CMV desejado', () => {
    // custo 7.50, CMV ideal 30% -> preço ideal bruto = 7.50 / 0.30 = 25.00
    const result = suggestPrices(7.5, 30);
    expect(result.ideal).toBeCloseTo(25.9); // arredondado pra cima, comercial
    // mínimo usa CMV mais alto (35%) -> preço mais baixo que o ideal
    expect(result.minimum).toBeLessThan(result.ideal);
    // premium usa CMV mais baixo (25%) -> preço mais alto que o ideal
    expect(result.premium).toBeGreaterThan(result.ideal);
  });

  it('cada preço arredondado termina em ,90', () => {
    const result = suggestPrices(10, 33);
    for (const price of Object.values(result)) {
      expect(Number((price * 100).toFixed(0)) % 100).toBe(90);
    }
  });

  it('nunca arredonda pra baixo do que cobre o custo (não fica abaixo do bruto)', () => {
    const totalCost = 12.34;
    const cmv = 40;
    const raw = totalCost / (cmv / 100);
    const result = suggestPrices(totalCost, cmv);
    expect(result.ideal).toBeGreaterThanOrEqual(raw);
  });

  it('não deixa o CMV do premium chegar a 0 ou negativo mesmo com CMV desejado bem baixo', () => {
    const result = suggestPrices(10, 2);
    expect(result.premium).toBeGreaterThan(0);
    expect(Number.isFinite(result.premium)).toBe(true);
  });

  it('custo 0 dá preços 0 (não quebra com divisão por CMV válido)', () => {
    const result = suggestPrices(0, 30);
    expect(result.minimum).toBe(0);
    expect(result.ideal).toBe(0);
    expect(result.premium).toBe(0);
  });
});
