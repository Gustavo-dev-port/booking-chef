import { supabase } from '../../lib/supabase';

/**
 * Instrumentação do funil de ativação (`analytics_events`, ver
 * docs/07_DATABASE.md §2 e docs/01_PRD.md §9). A tabela e o enum de
 * eventos já existiam desde a V1, mas nenhum lugar do app gravava nela —
 * achado real ao verificar `docs/13_MONETIZACAO_VENDAS.md` §6 (funil de
 * vendas): o funil descrito ali não tinha como ser medido. Este módulo
 * cobre só os eventos com uma tela real por trás hoje — `login`,
 * `inventory_started`/`inventory_completed`/`second_inventory_completed`
 * existem no CHECK do banco mas não têm fluxo de "contagem de estoque"
 * implementado no app ainda (ver docs/11_BACKLOG.md, Épico 14) — chamar
 * logEvent com um desses três é responsabilidade de quem construir essa
 * tela, não deste módulo.
 *
 * Best-effort, de propósito — mesmo princípio de saveCostSnapshot em
 * src/features/recipes/costSnapshot.ts: registrar telemetria nunca pode
 * travar ou falhar visivelmente o fluxo principal do usuário (criar
 * conta, cadastrar insumo, etc.) por causa de um evento perdido.
 */
export type AnalyticsEventName =
  | 'signup_completed'
  | 'company_created'
  | 'ingredient_created'
  | 'first_ingredient_created'
  | 'product_created'
  | 'first_product_created'
  | 'login';

export async function logEvent(
  eventName: AnalyticsEventName,
  options: { companyId?: string; userId?: string; metadata?: Record<string, unknown> } = {}
): Promise<void> {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      company_id: options.companyId ?? null,
      user_id: options.userId ?? null,
      metadata: options.metadata ?? {},
    });
    if (error) console.error('Falha ao registrar evento de analytics:', eventName, error.message);
  } catch (error) {
    console.error('Falha ao registrar evento de analytics:', eventName, error);
  }
}
