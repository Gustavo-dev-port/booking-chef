import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  terms_accepted_at: string | null;
  marketing_opt_in: boolean;
};

export type Membership = {
  company_id: string;
  /**
   * Mistura dois vocabulários de propósito — ver
   * src/features/team/permissions.ts (`resolveAppRole`), que é sempre
   * quem deve interpretar esse valor daqui pra frente: quando
   * `is_owner` é true, vem de `company_users.role` (sempre
   * 'proprietario' nesse caso); quando não, vem de `employees.role`
   * (funcionário ativo — V2, história 08.2).
   */
  role: string;
  is_owner: boolean;
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  membership: Membership | null;
  /** true até a primeira checagem de sessão/perfil terminar (splash). */
  isLoading: boolean;
  /**
   * true enquanto o usuário está no meio do fluxo de "esqueci minha senha"
   * (sessão de recuperação criada pelo link do email). Enquanto for true,
   * o layout raiz não deve tratar `session` como "logado de verdade" —
   * senão o guard de rotas tira o usuário da tela de nova senha.
   */
  isRecovering: boolean;
  setRecovering: (value: boolean) => void;
  /**
   * true enquanto o usuário está no meio do fluxo de convite de
   * funcionário (V2, história 08.2) — sessão criada pelo link do email
   * de convite, mas ainda sem profile/employees ativo. Mesmo motivo de
   * isRecovering: sem essa checagem, o guard de rotas mandaria essa
   * sessão (sem profile ainda) pro grupo (onboarding) — que cria uma
   * empresa NOVA, errado pra quem está sendo convidado pra uma já
   * existente.
   */
  isAcceptingInvite: boolean;
  setAcceptingInvite: (value: boolean) => void;
  refreshProfile: () => Promise<void>;
};

async function loadProfileAndMembership(session: Session) {
  const [{ data: profile }, { data: ownerMembership }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email, phone, terms_accepted_at, marketing_opt_in')
      .eq('id', session.user.id)
      .maybeSingle(),
    supabase
      .from('company_users')
      .select('company_id, role, is_owner')
      .eq('user_id', session.user.id)
      .maybeSingle(),
  ]);

  if (ownerMembership) {
    return { profile: (profile as Profile) ?? null, membership: ownerMembership as Membership };
  }

  // V2, história 08.2 — funcionário convidado/ativo não tem linha em
  // company_users (decisão do spike, Sprint 1); resolve o vínculo via
  // employees. RLS de employees já libera o próprio usuário ler a
  // própria linha mesmo sem ser "membro" ainda.
  const { data: employeeRow } = await supabase
    .from('employees')
    .select('company_id, role')
    .eq('user_id', session.user.id)
    .eq('status', 'ativo')
    .maybeSingle();

  const membership: Membership | null = employeeRow
    ? { company_id: employeeRow.company_id, role: employeeRow.role, is_owner: false }
    : null;

  return { profile: (profile as Profile) ?? null, membership };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  membership: null,
  isLoading: true,
  isRecovering: false,
  setRecovering: (value) => set({ isRecovering: value }),
  isAcceptingInvite: false,
  setAcceptingInvite: (value) => set({ isAcceptingInvite: value }),
  refreshProfile: async () => {
    const { session } = get();
    if (!session) return;
    const { profile, membership } = await loadProfileAndMembership(session);
    set({ profile, membership });
  },
}));

async function applySession(session: Session | null) {
  if (!session) {
    useAuthStore.setState({ session: null, profile: null, membership: null, isLoading: false });
    return;
  }
  const { profile, membership } = await loadProfileAndMembership(session);
  useAuthStore.setState({ session, profile, membership, isLoading: false });
}

let listenerStarted = false;

/** Chamar uma única vez, no layout raiz. Idempotente. */
export function startAuthListener() {
  if (listenerStarted) return;
  listenerStarted = true;

  supabase.auth.getSession().then(({ data }) => {
    applySession(data.session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    // Durante a recuperação de senha (ver isRecovering), o listener ainda
    // atualiza profile/membership normalmente — quem decide não navegar
    // para dentro do app é o guard no layout raiz, olhando isRecovering.
    applySession(session);
  });
}
