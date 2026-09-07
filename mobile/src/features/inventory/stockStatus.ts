/**
 * Status de estoque (Design System v1, seção "05 · Componentes" — "Tags
 * de estoque"): Em dia (saldo ≥ 1,5× mínimo) · Atenção (entre 1,0× e
 * 1,5×) · Repor (abaixo do mínimo) · Sem mínimo (ainda não configurado).
 * Lógica pura, sem `supabase`, mesmo motivo de cmv.ts/pricing.ts.
 *
 * "A cor nunca é o único sinal: sempre acompanha texto ('Repor') e a
 * razão saldo/mínimo" — por isso o rótulo (não só a cor) é sempre
 * exibido junto (ver STOCK_STATUS_LABELS).
 */
export type StockStatus = 'ok' | 'attention' | 'reorder' | 'noMinimum';

export function computeStockStatus(current: number, minimum: number): StockStatus {
  if (minimum <= 0) return 'noMinimum';
  const ratio = current / minimum;
  if (ratio < 1) return 'reorder';
  if (ratio < 1.5) return 'attention';
  return 'ok';
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  ok: 'Em dia',
  attention: 'Atenção',
  reorder: 'Repor',
  noMinimum: 'Sem mínimo',
};

/** Classes Tailwind (bg/texto) de cada tag — tokens do Design System v1. */
export const STOCK_STATUS_CLASSES: Record<StockStatus, string> = {
  ok: 'bg-success-bg text-success-text dark:bg-surface-border-dark dark:text-success-dark',
  attention: 'bg-warning-bg text-warning-text dark:bg-surface-border-dark dark:text-warning-dark',
  reorder: 'bg-danger-bg text-danger-pressed dark:bg-surface-border-dark dark:text-danger-dark',
  noMinimum: 'bg-surface-alt text-ink-secondary dark:bg-surface-border-dark dark:text-ink-secondary-dark',
};
