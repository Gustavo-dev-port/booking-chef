import { listEntranceDelay } from './listEntrance';

describe('listEntranceDelay', () => {
  it('cresce 40ms por item', () => {
    expect(listEntranceDelay(0)).toBe(0);
    expect(listEntranceDelay(1)).toBe(40);
    expect(listEntranceDelay(3)).toBe(120);
  });

  it('capa em 8 itens pra não acumular atraso absurdo em listas grandes', () => {
    expect(listEntranceDelay(8)).toBe(320);
    expect(listEntranceDelay(9)).toBe(320);
    expect(listEntranceDelay(50)).toBe(320);
  });
});
