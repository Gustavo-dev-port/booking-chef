import { computeStockStatus } from './stockStatus';

describe('computeStockStatus', () => {
  it('sem mínimo configurado (0) sempre dá noMinimum, mesmo com saldo alto', () => {
    expect(computeStockStatus(100, 0)).toBe('noMinimum');
    expect(computeStockStatus(0, 0)).toBe('noMinimum');
  });

  it('abaixo do mínimo (ratio < 1) dá reorder', () => {
    expect(computeStockStatus(5, 10)).toBe('reorder');
    expect(computeStockStatus(0, 10)).toBe('reorder');
  });

  it('entre 1x e 1.5x do mínimo dá attention', () => {
    expect(computeStockStatus(10, 10)).toBe('attention');
    expect(computeStockStatus(14, 10)).toBe('attention');
  });

  it('1.5x ou mais do mínimo dá ok', () => {
    expect(computeStockStatus(15, 10)).toBe('ok');
    expect(computeStockStatus(100, 10)).toBe('ok');
  });
});
