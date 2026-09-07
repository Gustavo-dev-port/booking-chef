/**
 * Calculadora de preço sugerido (V2, Épico 07, história 07.4) — lógica
 * pura, sem `supabase`, mesmo motivo de cmv.ts.
 *
 * A partir do custo total e de um CMV% desejado, sugere três preços:
 * "mínimo" (CMV mais alto — cobre o custo com menos folga, preço mais
 * baixo), "ideal" (exatamente o CMV informado) e "premium" (CMV mais
 * baixo — mais margem, preço mais alto). O espaçamento entre eles é de
 * ±5 pontos percentuais de CMV, arbitrário mas documentado aqui — não é
 * uma regra do PRD, é só uma forma de mostrar 3 opções em vez de 1.
 */
export type SuggestedPrices = {
  minimum: number;
  ideal: number;
  premium: number;
};

const CMV_SPREAD_POINTS = 5;
/** CMV% nunca chega a 0 (divisão por zero) nem fica negativo. */
const MIN_CMV_PERCENTAGE = 1;

/** Arredonda pra cima, pra terminação comercial ",90" (ex.: 15,34 -> 15,90). Nunca arredonda pra baixo — o preço sugerido nunca fica abaixo do que cobre o custo calculado. */
function roundToCommercialEnding(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round((Math.ceil(value - 0.9) + 0.9) * 100) / 100;
}

function priceForCmv(totalCost: number, cmvPercentage: number): number {
  if (cmvPercentage <= 0) return 0;
  return roundToCommercialEnding(totalCost / (cmvPercentage / 100));
}

export function suggestPrices(totalCost: number, desiredCmvPercentage: number): SuggestedPrices {
  const idealCmv = Math.max(desiredCmvPercentage, MIN_CMV_PERCENTAGE);
  const minimumCmv = idealCmv + CMV_SPREAD_POINTS;
  const premiumCmv = Math.max(idealCmv - CMV_SPREAD_POINTS, MIN_CMV_PERCENTAGE);

  return {
    minimum: priceForCmv(totalCost, minimumCmv),
    ideal: priceForCmv(totalCost, idealCmv),
    premium: priceForCmv(totalCost, premiumCmv),
  };
}
