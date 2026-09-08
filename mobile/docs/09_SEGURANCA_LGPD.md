---
documento: "09 — Segurança e LGPD"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 09 — Segurança e LGPD

## Índice

1. [LGPD](#1-lgpd)
2. [Criptografia](#2-criptografia)
3. [BCrypt (hash de senha)](#3-bcrypt-hash-de-senha)
4. [JWT e Refresh Token](#4-jwt-e-refresh-token)
5. [RLS (Row Level Security)](#5-rls-row-level-security)
6. [Auditoria e logs](#6-auditoria-e-logs)
7. [Matriz de permissões RBAC](#7-matriz-de-permissões-rbac)
8. [Dados que nunca devem ser expostos](#8-dados-que-nunca-devem-ser-expostos)

---

## 1. LGPD

### 1.1 Consentimento

O aceite dos Termos de Uso é um passo obrigatório e explícito do onboarding (`FormCheckbox`, não pré-marcado) — sem ele, a conclusão do cadastro fica bloqueada. A data/hora exata do aceite é gravada em `profiles.terms_accepted_at`, servindo como evidência de consentimento. O opt-in de comunicação de marketing (`marketing_opt_in`) é um checkbox **separado**, também não pré-marcado — consentimento para um fim nunca é reaproveitado para outro.

### 1.2 Política de Privacidade

Acessível a qualquer momento (onboarding e tela de Perfil), descrevendo: quais dados são coletados (identificação do usuário e do estabelecimento, conteúdo cadastrado), para que são usados (operar o app — autenticação, associação ao estabelecimento, geração de booking), onde ficam armazenados (Supabase, com controle de acesso por empresa via RLS) e quais são os direitos do titular.

> **Status atual:** o texto em produção na V1 é um **placeholder**, sinalizado como tal na própria interface. Precisa de revisão jurídica formal antes de qualquer publicação do app em loja — item já registrado como pendência conhecida (ver `10_ROADMAP.md`).

### 1.3 Exclusão de conta (direito à eliminação)

Implementada como uma Edge Function dedicada (`delete-account`, ver §5 e `06_ARQUITETURA.md`), não um formulário de contato. Apaga, em cascata e de forma irreversível: a empresa, as fichas técnicas, os insumos conciliados, as fotos no Storage e o próprio usuário no Supabase Auth. A interface exige confirmação em duas etapas antes de disparar a ação (heurística de prevenção de erro, `04_UX_GUIDELINES.md`).

**V2 — nuance a resolver:** quando existir mais de um usuário por empresa, "excluir minha conta" precisa distinguir claramente entre *sair da equipe* (remove só o vínculo da pessoa) e *excluir a empresa inteira* (só o proprietário pode, e afeta todos os membros) — este documento sinaliza a decisão como pendente de especificação antes da implementação da V2, para não ser resolvida de forma improvisada em código.

### 1.4 Dado de assinatura/pagamento (categoria nova, ainda sem implementação — Épico 14)

Achado ao verificar `13_MONETIZACAO_VENDAS.md`: esse documento descreve cobrança recorrente (Free/Basic/Premium), mas nenhuma linha deste pacote de segurança cobria dado financeiro/de assinatura como categoria própria. Registrado aqui agora, antes de existir código, para a implementação do Épico 14 (`11_BACKLOG.md` §6) nascer já dentro da mesma disciplina do resto do produto, em vez de essa lacuna só ser notada depois de já estar em produção:

- **Número de cartão/dado de pagamento em si nunca deve tocar o app nem o Supabase.** A cobrança passa pelo Google Play Billing (`13_MONETIZACAO_VENDAS.md` §4.1) — o app só recebe de volta um identificador de assinatura/recibo do Google, nunca o dado bruto do cartão. Isso evita colocar o produto em escopo de PCI-DSS, e é uma decisão de arquitetura, não só uma prática recomendada.
- **O que o Booking Chef vai armazenar de fato** (quando o Épico 14 existir): plano vigente por empresa, status da assinatura (ativa/trial/cancelada/inadimplente), datas de início/renovação/fim de trial, e o identificador de assinatura da Play Store — nenhum dado bancário. Esses campos são dado pessoal/comercial sob LGPD (identificam capacidade de pagamento e comportamento de compra do titular), mesmo não sendo dado financeiro sensível no sentido de PCI — precisam de base legal (execução de contrato, já que é o que sustenta o serviço pago) e do mesmo tratamento de RLS por `company_id` já usado em todo o resto do schema.
- **Retenção:** segue o mesmo princípio de soft-delete já usado em todo o produto (nunca apagar histórico de cobrança silenciosamente) — mas exclusão de conta (§1.3) continua tendo que apagar/anonimizar esse histórico também, já que é a mesma pessoa exercendo o direito à eliminação; a Edge Function `delete-account` precisa ser estendida quando o Épico 14 existir, não esquecida.

## 2. Criptografia

| Camada | Mecanismo |
|---|---|
| Em trânsito | HTTPS/TLS em toda comunicação com o Supabase |
| Em repouso (banco e Storage) | Gerenciado pela infraestrutura do Supabase |
| No dispositivo (sessão) | `expo-secure-store` — Keychain (iOS) / Keystore (Android); nunca `AsyncStorage` puro. Sessões maiores que ~2048 bytes são fatiadas em blocos (`chunking`) para respeitar o limite prático de algumas versões de iOS, sem abrir mão do armazenamento seguro nativo |
| No dispositivo (dado offline, V3) | O cache SQLite local (ver `06_ARQUITETURA.md`) precisa ser avaliado quanto à necessidade de criptografia em repouso (`SQLCipher` ou equivalente) antes da implementação da V3, especialmente se passar a guardar dado de custo/CMV localmente |

## 3. BCrypt (hash de senha)

O app **nunca implementa hashing de senha manualmente** — é delegado inteiramente ao Supabase Auth, que usa **bcrypt** internamente no servidor de autenticação. A senha em texto puro trafega do dispositivo ao Supabase Auth só durante o login/cadastro, sob TLS, e nunca é armazenada nem logada pelo código do app. Nenhuma rota, função ou log do Booking Chef tem acesso ao hash da senha.

## 4. JWT e Refresh Token

- O login retorna um **JWT de acesso** de curta duração e um **refresh token** de longa duração.
- O cliente Supabase (`autoRefreshToken: true`) renova o access token automaticamente antes de expirar — o usuário nunca precisa logar de novo por expiração natural do token durante o uso contínuo do app.
- O app trata o JWT como **token opaco**: nunca o decodifica, inspeciona ou usa seu conteúdo para decisão de UI — toda decisão de acesso é validada no servidor (RLS), o JWT só carrega a identidade.
- Refresh token e access token são armazenados exclusivamente via `expo-secure-store` (ver §2) — nunca em `AsyncStorage`, nunca em log, nunca em analytics de terceiros.

## 5. RLS (Row Level Security)

Toda tabela de domínio do banco tem RLS habilitado — o isolamento entre estabelecimentos acontece no Postgres, não em uma checagem de código no app (um bug de UI não pode, por si só, vazar dado entre empresas).

Pontos centrais do modelo, válidos para a V1 e como base para as tabelas novas da V2/V3:

- **Isolamento por `company_id`**, testado de ponta a ponta com dados reais (múltiplos usuários/empresas) antes de qualquer linha de produto ser construída sobre ele.
- **`company_id` imutável** nas tabelas de domínio — uma vez criado, um registro não pode "trocar de dono" via `UPDATE`.
- **Criação de empresa exclusiva de uma função `SECURITY DEFINER`** (`create_company_with_owner`), chamada via RPC — não existe `INSERT` liberado diretamente em `companies`/`company_users` para o client. A função tem triggers anti-autoelevação: ninguém consegue se atribuir a uma empresa diferente da que acabou de criar, nem um papel diferente de `proprietario` nesse fluxo específico.
- **Funções sensíveis vivem no schema `private`**, com `search_path=''` fixado — elimina uma classe de ataque de sequestro de schema.
- **Privilégio de execução do papel `anon` revogado explicitamente** das funções sensíveis (achado real de um advisor de segurança do próprio Supabase — o comportamento padrão da plataforma libera `EXECUTE` para `anon` em funções novas).
- **Bucket de Storage privado** (`product-photos`), com policy de RLS pelo prefixo `{company_id}/...` do caminho do objeto; exibição sempre via URL assinada (validade de 1h), nunca URL pública.

**Requisito para V2/V3:** cada nova tabela (`inventory_items`, `employees`, `purchase_lists` etc.) precisa nascer com policy de RLS por `company_id` desde a migration inicial — nunca como um ajuste posterior. A matriz RBAC (§7) define, além do isolamento por empresa, **quem dentro da empresa** pode ler/escrever cada tabela — regra que também deve ser expressa em RLS (por `role` em `employees`/`company_users`), não só escondida na interface.

## 6. Auditoria e logs

| Mecanismo | Escopo | Status |
|---|---|---|
| `products.created_by` | Quem criou uma ficha | ✅ V1 |
| `products.version` (trigger de incremento) | Quantas vezes uma ficha foi alterada | ✅ V1 |
| `created_at`/`updated_at` em toda tabela | Quando cada registro foi criado/alterado | ✅ V1 |
| `inventory_movements.created_by` + histórico nunca apagado | Quem lançou cada movimentação de estoque | 🔜 V2 |
| `audit_logs` (tabela genérica, `entity_type`/`entity_id`/`previous_value`/`new_value`) | Trilha de auditoria campo a campo, para qualquer entidade | 🔜 V3 |
| `analytics_events` (schema já existe no banco compartilhado) | Funil de ativação (signup, criação de ficha, login) | Existe no banco; o Booking Chef ainda não emite esses eventos — pendência registrada em `10_ROADMAP.md` |

**Logs de aplicação:** nenhum log do app deve conter senha, token, JWT decodificado ou dado pessoal completo (CNPJ, endereço) em texto — logs de erro devem capturar o suficiente para diagnóstico (tipo de erro, tela, timestamp) sem serializar o payload inteiro da requisição.

## 7. Matriz de permissões RBAC

Perfis: **Proprietário**, **Gerente**, **Bartender**, **Cozinheiro**, **Visualizador**. ✅ = acesso de edição · 👁 = só leitura · — = sem acesso. Esta matriz vale a partir da V2 (múltiplos usuários) — na V1, o único papel existente na prática é `proprietario`.

| Recurso / Ação | Proprietário | Gerente | Bartender | Cozinheiro | Visualizador |
|---|---|---|---|---|---|
| Editar dados da empresa | ✅ | — | — | — | — |
| Convidar / remover usuários | ✅ | — | — | — | — |
| Excluir a empresa | ✅ | — | — | — | — |
| Fichas técnicas — Bar (ver) | ✅ | ✅ | ✅ | — | 👁 |
| Fichas técnicas — Bar (criar/editar) | ✅ | ✅ | ✅ | — | — |
| Fichas técnicas — Cozinha (ver) | ✅ | ✅ | — | ✅ | 👁 |
| Fichas técnicas — Cozinha (criar/editar) | ✅ | ✅ | — | ✅ | — |
| Arquivar ficha (qualquer módulo) | ✅ | ✅ | — | — | — |
| Gerar Booking (PDF) | ✅ | ✅ | ✅ (só Bar) | ✅ (só Cozinha) | 👁 (se aplicável) |
| Estoque — ver saldo/insumos | ✅ | ✅ | — | — | — |
| Estoque — cadastrar insumo | ✅ | ✅ | — | — | — |
| Estoque — lançar movimentação | ✅ | ✅ | — | — | — |
| Registrar produção (V3) | ✅ | ✅ | ✅ (Bar) | ✅ (Cozinha) | — |
| CMV / custo de receita (ver) | ✅ | ✅ | — | — | — |
| Preço sugerido (calculadora) | ✅ | ✅ | — | — | — |
| Aplicar preço sugerido à ficha | ✅ | ✅ | — | — | — |
| Dashboard (V3) | ✅ | ✅ | — | — | — |
| Lista de compras (V3) | ✅ | ✅ | — | — | — |
| Editar o próprio perfil | ✅ | ✅ | ✅ | ✅ | ✅ |
| Excluir a própria conta / sair da equipe | ✅* | ✅ | ✅ | ✅ | ✅ |

*Proprietário: "excluir a própria conta" na prática exclui a empresa inteira (é o único dono) — ver nuance registrada em §1.3.

**Regra estrutural:** a ausência de acesso deve ser reforçada em **dois lugares**, nunca só um — na interface (item de menu/tela oculta) e no banco (RLS por `role`). Um usuário `bartender` que tente acessar uma rota de Cozinha por link direto deve ser bloqueado pelo banco, mesmo que, por algum bug de UI, a navegação tenha permitido chegar lá.

## 8. Dados que nunca devem ser expostos

- **Chave de serviço do Supabase (`service_role key`)** — nunca no bundle do app; só em ambiente de servidor (Edge Functions).
- **Hash de senha** — nunca lido, transmitido ou logado pelo app.
- **Conteúdo do JWT/refresh token** — nunca logado em build de produção nem enviado a serviços de terceiros sem redação.
- **URLs assinadas do Storage** — validade de 1h por design; não cachear além disso, não compartilhar fora do contexto do usuário autenticado que as gerou.
- **CNPJ e dados cadastrais completos** — dados pessoais/empresariais protegidos por LGPD; nunca em log de terceiro ou ferramenta de analytics sem anonimização.
- **Conteúdo do bucket `product-photos`** — sempre via URL assinada; torná-lo público exigiria decisão deliberada e revisada, nunca um efeito colateral de configuração.
- **`audit_logs.previous_value`/`new_value` (V3)** — por poderem conter dado sensível de negócio (preço, custo), o acesso a esta tabela deve seguir a mesma matriz RBAC de quem pode ver CMV/preço, não ser aberta a todo usuário autenticado só por ser "log".
