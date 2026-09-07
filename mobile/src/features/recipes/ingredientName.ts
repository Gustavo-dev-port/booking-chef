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

/** Distância de edição (Levenshtein) — usada só por findSimilarExistingName, pra achar nomes "quase iguais". */
function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

/**
 * Acha, entre `existingNames`, o mais parecido com `name` — pra avisar
 * antes de criar um insumo quase-duplicado (ex.: "Vermute" vs
 * "Vermuth", ou "Água" vs "agua"). Duplicata exata (após normalizar)
 * sempre vence; senão, o nome existente a até 2 caracteres de distância
 * mais próximo. Retorna null se não achar nada parecido.
 */
export function findSimilarExistingName(name: string, existingNames: string[]): string | null {
  const normalized = normalizeIngredientName(name);
  if (!normalized) return null;

  let closest: { original: string; distance: number } | null = null;
  for (const existing of existingNames) {
    const normalizedExisting = normalizeIngredientName(existing);
    if (normalizedExisting === normalized) return existing;
    const distance = levenshteinDistance(normalized, normalizedExisting);
    if (distance <= 2 && (closest === null || distance < closest.distance)) {
      closest = { original: existing, distance };
    }
  }
  return closest?.original ?? null;
}
