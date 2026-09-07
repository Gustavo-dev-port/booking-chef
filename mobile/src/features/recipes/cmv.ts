/**
 * Cálculo de custo/CMV (V2, Épico 07, história 07.2) — lógica pura, sem
 * `supabase`, pra ficar testável e reutilizável tanto na tela de edição
 * (recalcula a cada tecla, via useWatch) quanto num futuro snapshot
 * (07.3, Sprint 4).
 */
export type CmvIngredientRow = {
  ingredientId?: string;
  quantity: number;
};

export type CmvSummary = {
  /** Soma de quantidade × custo unitário, só das linhas vinculadas ao estoque. */
  totalCost: number;
  /** true se alguma linha não tem custo conhecido (ingrediente texto livre) — o total pode estar incompleto. */
  hasUnknownCost: boolean;
  /** null quando não há preço de venda definido ainda — CMV% não faz sentido sem ele. */
  cmvPercentage: number | null;
  grossMargin: number | null;
};

export function calculateCmv(
  ingredients: CmvIngredientRow[],
  costById: Map<string, number>,
  salePrice: number | undefined
): CmvSummary {
  let totalCost = 0;
  let hasUnknownCost = false;

  for (const row of ingredients) {
    if (row.ingredientId && costById.has(row.ingredientId)) {
      totalCost += (costById.get(row.ingredientId) ?? 0) * (row.quantity || 0);
    } else {
      hasUnknownCost = true;
    }
  }

  const hasSalePrice = typeof salePrice === 'number' && salePrice > 0;

  return {
    totalCost,
    hasUnknownCost,
    cmvPercentage: hasSalePrice ? (totalCost / salePrice) * 100 : null,
    grossMargin: hasSalePrice ? salePrice - totalCost : null,
  };
}

/**
 * Status do CMV% (Design System v1, seção "05 · Componentes → Indicador
 * de CMV") relativo a uma meta — 30% é o valor usado no próprio mock do
 * design ("A marca preta é a meta do estabelecimento"); o app ainda não
 * tem uma meta configurável por empresa, então fica fixo aqui até isso
 * existir.
 */
export type CmvStatus = 'ok' | 'attention' | 'danger';

const DEFAULT_CMV_TARGET = 30;
/** Acima de quantos pontos percentuais sobre a meta o status vira "risco" (danger) em vez de só "atenção". */
const DANGER_THRESHOLD_POINTS = 5;

export function computeCmvStatus(cmvPercentage: number, target: number = DEFAULT_CMV_TARGET): CmvStatus {
  const diff = cmvPercentage - target;
  if (diff <= 0) return 'ok';
  if (diff <= DANGER_THRESHOLD_POINTS) return 'attention';
  return 'danger';
}

export function cmvStatusLabel(status: CmvStatus, cmvPercentage: number, target: number = DEFAULT_CMV_TARGET): string {
  const diff = cmvPercentage - target;
  if (status === 'ok') return 'abaixo da meta';
  if (status === 'attention') return `${diff.toFixed(1)} pp acima`;
  return 'margem em risco';
}

/** Classes Tailwind (texto e barra) de cada status — tokens do Design System v1. */
export const CMV_STATUS_CLASSES: Record<CmvStatus, { text: string; bar: string }> = {
  ok: { text: 'text-success-text dark:text-success-dark', bar: 'bg-success dark:bg-success-dark' },
  attention: { text: 'text-warning-text dark:text-warning-dark', bar: 'bg-warning dark:bg-warning-dark' },
  danger: { text: 'text-danger-pressed dark:text-danger-dark', bar: 'bg-danger dark:bg-danger-dark' },
};
