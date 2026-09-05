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

// Guarda contra corrida (bug real, achado depois de reportado: "abre o
// app recém-instalado e manda pra completar cadastro; fecha e abre nunca
// mais acontece"). Causa: getSession() E onAuthStateChange disparavam
// applySession() EM PARALELO no cold start (onAuthStateChange já chama
// de novo sozinho com o evento INITIAL_SESSION assim que o cliente
// inicializa — ver docs do supabase-js —, então o getSession() era
// redundante). Duas chamadas concorrentes a loadProfileAndMembership
// podem resolver fora de ordem; se a mais VELHA (com um JWT ainda não
// totalmente propagado pro cliente REST, retornando profile/membership
// vazios por RLS) terminar DEPOIS da mais nova, ela sobrescrevia o
// estado correto com null — mandando um usuário com cadastro completo
// de volta pro onboarding. `requestSeq` garante que só o resultado da
// chamada mais recente é aplicado, não importa a ordem de resolução.
let requestSeq = 0;

async function applySession(session: Session | null) {
  const seq = ++requestSeq;
  if (!session) {
    if (seq === requestSeq) useAuthStore.setState({ session: null, profile: null, membership: null, isLoading: false });
    return;
  }
  const { profile, membership } = await loadProfileAndMembership(session);
  if (seq !== requestSeq) return; // uma chamada mais nova já resolveu antes desta — descarta o resultado desatualizado.
  useAuthStore.setState({ session, profile, membership, isLoading: false });
}

let listenerStarted = false;

/** Chamar uma única vez, no layout raiz. Idempotente. */
export function startAuthListener() {
  if (listenerStarted) return;
  listenerStarted = true;

  // Só onAuthStateChange, de propósito — ele já dispara sozinho com o
  // evento INITIAL_SESSION assim que o cliente carrega a sessão
  // persistida, então uma chamada extra a getSession() aqui só
  // duplicava a checagem (e causava a corrida documentada acima).
  supabase.auth.onAuthStateChange((_event, session) => {
    // Durante a recuperação de senha (ver isRecovering), o listener ainda
    // atualiza profile/membership normalmente — quem decide não navegar
    // para dentro do app é o guard no layout raiz, olhando isRecovering.
    applySession(session);
  });
}
