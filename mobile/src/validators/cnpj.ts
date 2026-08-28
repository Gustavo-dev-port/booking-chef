/**
 * CNPJ — validação e formatação. O banco grava sempre só dígitos
 * (`companies.cnpj`, constraint `^[0-9]{14}$`); a máscara é responsabilidade
 * só da interface, conforme FASE1-ARQUITETURA.md (seção 5.3).
 */

export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCnpj(value: string): string {
  const digits = normalizeCnpj(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function calcCheckDigit(base: string, weights: number[]): number {
  const sum = base
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Valida os dígitos verificadores (mód. 11), não só o formato. */
export function isValidCnpj(value: string): boolean {
  const digits = normalizeCnpj(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false; // todos os dígitos iguais

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstCheck = calcCheckDigit(digits.slice(0, 12), firstWeights);
  const secondCheck = calcCheckDigit(digits.slice(0, 12) + firstCheck, secondWeights);

  return digits.slice(12) === `${firstCheck}${secondCheck}`;
}
