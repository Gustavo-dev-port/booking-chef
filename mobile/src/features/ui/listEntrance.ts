/**
 * Atraso da entrada escalonada de item de lista (Design System v1, seção
 * 07 · Microinterações) — cada item some/aparece um pouco depois do
 * anterior, capado pra listas grandes não acumularem um atraso absurdo no
 * fim (ex.: item 50 não espera 2s pra entrar).
 */
const STAGGER_MS = 40;
const STAGGER_CAP = 8;

export function listEntranceDelay(index: number): number {
  return Math.min(index, STAGGER_CAP) * STAGGER_MS;
}
