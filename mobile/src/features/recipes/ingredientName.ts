/**
 * Normalização de nome de insumo — usada pela conciliação da Fase 8 (ver
 * reconciliation.ts). Fica num arquivo próprio, sem importar `supabase`,
 * de propósito: é lógica pura, testável sem precisar mockar o cliente
 * Supabase nem variáveis de ambiente.
 */

// Marcas de acento combinantes (bloco Unicode U+0300–U+036F), depois do
// NFD separar a letra base do acento. Construído via String.fromCharCode
// (não como caractere combinante literal no source) de propósito — um
// combinante literal no código gruda visualmente no caractere anterior e
// vira uma armadilha pra editar sem perceber.
const COMBINING_MARKS_START = 0x0300;
const COMBINING_MARKS_END = 0x036f;
const COMBINING_MARKS_REGEX = new RegExp(
  '[' + String.fromCharCode(COMBINING_MARKS_START) + '-' + String.fromCharCode(COMBINING_MARKS_END) + ']',
  'g'
);

/** Normaliza pra comparação: sem espaço nas pontas, minúsculo, sem acento, espaços internos colapsados. */
export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(COMBINING_MARKS_REGEX, '').replace(/\s+/g, ' ');
}
