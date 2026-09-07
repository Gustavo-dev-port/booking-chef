import { useEffect } from 'react';
import { router } from 'expo-router';

/**
 * Reforça na interface o que a RLS já bloqueia de verdade no banco (V2,
 * história 08.3 — "bloqueado tanto pela interface quanto pela regra de
 * RLS... nunca só pela interface"): manda de volta pra Home se
 * `allowed` for false, em vez de deixar a tela renderizar e toda query
 * vir vazia/falhar silenciosamente.
 */
export function useRoleGuard(allowed: boolean) {
  useEffect(() => {
    if (!allowed) router.replace('/');
  }, [allowed]);
}
