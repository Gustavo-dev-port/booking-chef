import { formatCnpj, isValidCnpj, normalizeCnpj } from './cnpj';

describe('normalizeCnpj', () => {
  it('remove tudo que não é dígito', () => {
    expect(normalizeCnpj('11.014.400/0001-72')).toBe('11014400000172');
    expect(normalizeCnpj('CNPJ: 11.014.400/0001-72 (matriz)')).toBe('11014400000172');
  });
});

describe('formatCnpj', () => {
  it('aplica a máscara padrão', () => {
    expect(formatCnpj('11014400000172')).toBe('11.014.400/0001-72');
  });

  it('formata parcialmente enquanto o usuário ainda está digitando', () => {
    expect(formatCnpj('1101')).toBe('11.01');
    expect(formatCnpj('11014400')).toBe('11.014.400');
  });

  it('ignora dígitos além do 14º', () => {
    expect(formatCnpj('110144000001729999')).toBe('11.014.400/0001-72');
  });
});

describe('isValidCnpj', () => {
  it('aceita um CNPJ com dígitos verificadores corretos', () => {
    expect(isValidCnpj('11014400000172')).toBe(true);
    expect(isValidCnpj('11.014.400/0001-72')).toBe(true);
  });

  it('rejeita dígito verificador errado', () => {
    expect(isValidCnpj('11014400000173')).toBe(false);
  });

  it('rejeita tamanho errado', () => {
    expect(isValidCnpj('1101440000017')).toBe(false);
    expect(isValidCnpj('110144000001722')).toBe(false);
    expect(isValidCnpj('')).toBe(false);
  });

  it('rejeita sequência de dígitos repetidos', () => {
    expect(isValidCnpj('11111111111111')).toBe(false);
    expect(isValidCnpj('00000000000000')).toBe(false);
  });
});
