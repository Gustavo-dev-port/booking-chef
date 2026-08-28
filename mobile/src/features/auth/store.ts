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
  refreshProfile: () => Promise<void>;
};

async function loadProfileAndMembership(session: Session) {
  const [{ data: profile }, { data: membership }] = await Promise.all([
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
  return { profile: (profile as Profile) ?? null, membership: (membership as Membership) ?? null };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  membership: null,
  isLoading: true,
  isRecovering: false,
  setRecovering: (value) => set({ isRecovering: value }),
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
