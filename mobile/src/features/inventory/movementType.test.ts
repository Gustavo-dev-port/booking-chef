import { movementTypeLabel } from './movementType';

describe('movementTypeLabel', () => {
  it('traduz os 4 tipos selecionáveis', () => {
    expect(movementTypeLabel('entrada')).toBe('Entrada');
    expect(movementTypeLabel('saida')).toBe('Saída');
    expect(movementTypeLabel('ajuste')).toBe('Ajuste (contagem)');
    expect(movementTypeLabel('perda')).toBe('Perda');
  });

  it('devolve o próprio valor pra um tipo desconhecido (ex.: producao, reservado pro Épico 09)', () => {
    expect(movementTypeLabel('producao')).toBe('producao');
  });
});
