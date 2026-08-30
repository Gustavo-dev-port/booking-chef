---
documento: "04 — UX Guidelines"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 04 — UX Guidelines

## Índice

1. [As 10 heurísticas de Nielsen aplicadas ao produto](#1-as-10-heurísticas-de-nielsen-aplicadas-ao-produto)
2. [Convenções de wireframe e acessibilidade](#2-convenções-de-wireframe-e-acessibilidade)
3. [Telas — V1 (implementadas)](#3-telas--v1-implementadas)
4. [Telas — V2 (planejadas)](#4-telas--v2-planejadas)
5. [Telas — V3 (planejadas)](#5-telas--v3-planejadas)

---

## 1. As 10 heurísticas de Nielsen aplicadas ao produto

| # | Heurística | Aplicação no Booking Chef |
|---|---|---|
| 1 | Visibilidade do status do sistema | Todo botão que chama o backend tem estado de carregamento (spinner, nunca a tela "travada" sem explicação); listas usam "puxar para atualizar"; splash só some quando sessão e tema terminam de carregar. |
| 2 | Correspondência com o mundo real | Vocabulário do estabelecimento ("Ficha técnica", "Copo utilizado", "Modo de preparo"), nunca vocabulário de banco de dados; ícones com emoji reconhecíveis (🍸 Bar, 👨‍🍳 Cozinha, 📖 Booking, 📦 Estoque). |
| 3 | Controle e liberdade do usuário | Botão de voltar em toda tela secundária; "arquivar" em vez de excluir fichas; qualquer linha de ingrediente pode ser removida individualmente; cancelar sempre disponível em formulários longos. |
| 4 | Consistência e padrões | Um componente único por tipo de elemento (campo, botão, card, chip) reutilizado em 100% das telas — ver `05_DESIGN_SYSTEM.md`; mesma tela de lista para Bar e Cozinha, só trocando o filtro. |
| 5 | Prevenção de erros | Validação bloqueia o envio antes da chamada de rede; listas fechadas (unidade de ingrediente, segmento do estabelecimento) eliminam erro de digitação livre; ações destrutivas (excluir conta, remover funcionário) sempre pedem confirmação explícita. |
| 6 | Reconhecimento em vez de memorização | Onboarding preenche dados da empresa a partir do CNPJ; categorias já usadas aparecem como chips clicáveis na busca; seleção de ingrediente do estoque (V2) preenche unidade/custo automaticamente. |
| 7 | Flexibilidade e eficiência de uso | Busca + filtro + ordenação na lista de fichas; atalhos de fichas recentes na Home; papéis de acesso (V2) evitam que cada usuário veja opções irrelevantes ao seu trabalho. |
| 8 | Estética e design minimalista | Uma ação primária óbvia por tela; campos condicionais (Bar/Cozinha, ou tipo de movimentação de estoque) só aparecem quando fazem sentido no contexto atual. |
| 9 | Ajudar a reconhecer, diagnosticar e corrigir erros | Erros técnicos são sempre traduzidos para linguagem humana antes de aparecer na tela; a mensagem aparece junto ao campo/ação que a originou, nunca em um log genérico. |
| 10 | Ajuda e documentação | Hints diretamente no campo (ex.: "Mínimo de 8 caracteres"); estado vazio sempre explica o que fazer a seguir, nunca é uma tela em branco sem contexto. |

Toda superfície tocável respeita a área mínima de **44×44px** (acessibilidade WCAG/heurística 8), sem exceção — inclusive elementos visualmente pequenos como um "✕" de remover item.

## 2. Convenções de wireframe e acessibilidade

Os wireframes ASCII abaixo seguem a notação:

```
[Botão]        → ação tocável primária ou secundária
( Campo )      → campo de entrada de texto
{ Seleção }    → chip/seletor de opção única
<Card>         → elemento de lista/card
←              → botão de voltar
```

Acessibilidade é tratada como requisito, não como extra, em toda tela: alvo de toque ≥ 44×44px, contraste mínimo AA entre texto e fundo (ver `05_DESIGN_SYSTEM.md`), `accessibilityLabel`/`accessibilityRole` em todo elemento interativo, e nenhuma informação transmitida **só** por cor (erro sempre tem texto, não só borda vermelha; seleção sempre tem indicação textual/de estado, não só preenchimento).

---

## 3. Telas — V1 (implementadas)

### 3.1 Login

```
┌─────────────────────────┐
│                          │
│   Entrar                │
│                          │
│   ( Email            )  │
│   ( Senha        👁 )   │
│                          │
│   [   Entrar   ]         │
│                          │
│   Esqueci minha senha    │
│   [  Criar conta  ]      │
│                          │
└─────────────────────────┘
```

- **Objetivo:** autenticar em poucos toques.
- **Componentes:** campo de email, campo de senha com alternância de visibilidade, botão primário, link secundário, botão outline.
- **CTA principal:** "Entrar".
- **CTA secundário:** "Criar conta".
- **Estado vazio:** não se aplica.
- **Estado carregando:** botão "Entrar" mostra spinner e fica desabilitado durante a chamada.
- **Estado de erro:** mensagem abaixo dos campos, sem indicar qual campo especificamente está errado (segurança).
- **Mensagem amigável:** "Email ou senha incorretos." — nunca o erro técnico original.
- **Acessibilidade:** campos com `accessibilityLabel`; alternância de senha anunciada como "Mostrar senha"/"Ocultar senha".

### 3.2 Onboarding (Complete seu cadastro)

```
┌─────────────────────────┐
│ ←  Complete seu cadastro │
│                          │
│  Você                    │
│  ( Nome              )   │
│  ( Telefone opcional )   │
│                          │
│  Estabelecimento         │
│  ( CNPJ    ) [Buscar]    │
│  ( Razão social       )  │
│  { bar }{restaurante}... │
│  ( Cidade )( UF )        │
│                          │
│  ☐ Aceito os Termos      │
│  [ Concluir cadastro ]   │
└─────────────────────────┘
```

- **Objetivo:** coletar os dados mínimos de pessoa + estabelecimento numa tela só.
- **Componentes:** campos de texto, botão outline "Buscar dados da empresa", chips de seleção única, checkbox de aceite.
- **CTA principal:** "Concluir cadastro".
- **CTA secundário:** "Buscar dados da empresa" (preenchimento automático via CNPJ).
- **Estado vazio:** não se aplica.
- **Estado carregando:** botão de busca de CNPJ mostra spinner isoladamente, sem travar o resto do formulário.
- **Estado de erro:** "Digite um CNPJ válido antes de buscar."; "Não encontramos esse CNPJ. Preencha os dados manualmente." (não bloqueia o fluxo).
- **Mensagem amigável:** erros de negócio traduzidos (ex.: "Já existe uma empresa cadastrada com esse CNPJ.").
- **Acessibilidade:** chips com `accessibilityRole="radio"` e estado selecionado anunciado; botão de concluir desabilitado (não escondido) até o aceite dos Termos, com motivo perceptível.

### 3.3 Home

```
┌─────────────────────────┐
│  Fichas técnicas   Perfil│
│                          │
│  [ 🍸 Bar ] [👨‍🍳 Cozinha]│
│  [   📖 Gerar Booking  ] │
│                          │
│  Últimas fichas editadas │
│  <foto  Nome        >    │
│  <foto  Nome        >    │
└─────────────────────────┘
```

- **Objetivo:** ponto de entrada para os módulos e atalho às fichas recentes.
- **Componentes:** cards de módulo, lista de cards de ficha recente.
- **CTA principal:** entrar em Bar ou Cozinha.
- **CTA secundário:** "Gerar Booking".
- **Estado vazio:** "Nenhuma ficha editada ainda" no lugar da lista de recentes (os módulos continuam sempre visíveis).
- **Estado carregando:** lista de recentes some silenciosamente até resolver (seção secundária, não bloqueia a tela).
- **Estado de erro:** não há erro bloqueante nesta tela — falha ao buscar recentes só resulta em lista vazia.
- **Mensagem amigável:** N/A.
- **Acessibilidade:** cada card de módulo tem `accessibilityLabel` combinando título + subtítulo (ex.: "Bar: Drinks").

### 3.4 Lista de fichas (Bar/Cozinha)

```
┌─────────────────────────┐
│ ←  Bar                   │
│  ( Buscar por nome    )  │
│  {Todas}{Autorais}{Classicos}
│  Ordenar: Recentes · A-Z │
│                          │
│  <foto  Nome  Categoria> │
│  <foto  Nome  Categoria> │
│                       (+)│
└─────────────────────────┘
```

- **Objetivo:** encontrar ou criar uma ficha rapidamente.
- **Componentes:** busca, chips de categoria, alternância de ordenação, cards de ficha, botão flutuante "+".
- **CTA principal:** botão flutuante "+" (criar nova ficha).
- **CTA secundário:** tocar num card (abrir ficha existente).
- **Estado vazio:** "Você ainda não possui nenhuma ficha técnica" + botão central "Criar primeira ficha" (o "+" flutuante fica oculto para não duplicar a chamada à ação).
- **Estado carregando:** indicador de "puxar para atualizar" ativo.
- **Estado de erro:** sem mensagem dedicada — falha deixa a lista vazia, recuperável puxando a tela.
- **Mensagem amigável:** N/A (não há erro bloqueante nesta tela).
- **Acessibilidade:** chips com `accessibilityRole="radio"`; botão "+" com `accessibilityLabel="Criar nova ficha"`.

### 3.5 Editor de ficha técnica

```
┌─────────────────────────┐
│ ←  Nova ficha             │
│  ( Nome               )  │
│  Ingredientes             │
│  ( item )( qtd )( un ) ✕ │
│  [+ Adicionar ingrediente]│
│  ( Categoria )( Rendim. ) │
│  ( Copo )( Decoração )    │
│  ( Modo de preparo     )  │
│  ( Observações         )  │
│  [ 📷  Toque p/ foto   ]  │
│  [   Salvar ficha    ]    │
└─────────────────────────┘
```

- **Objetivo:** criar/editar uma ficha completa com fricção mínima.
- **Componentes:** campos de texto, lista dinâmica de ingredientes, seletor de unidade em folha modal, seletor de foto, botão primário e (em edição) botão de arquivar.
- **CTA principal:** "Salvar ficha".
- **CTA secundário:** "Arquivar ficha" (só em edição).
- **Estado vazio:** lista de ingredientes começa vazia numa ficha nova.
- **Estado carregando:** tela de "Carregando…" ao abrir uma ficha existente, antes do formulário aparecer preenchido.
- **Estado de erro:** "Ficha não encontrada."; validação por campo (nome obrigatório, quantidade ≥ 0, unidade obrigatória).
- **Mensagem amigável:** erro de salvamento sempre em português, junto ao botão de salvar.
- **Acessibilidade:** botão de remover ingrediente com `accessibilityLabel="Remover ingrediente"` (não depende só do ícone "✕" ser compreendido visualmente).

### 3.6 Gerar Booking

```
┌─────────────────────────┐
│ ←  Gerar Booking          │
│  ( ) Booking do Bar       │
│  (•) Booking da Cozinha   │
│  ( ) Os dois               │
│  [    Gerar PDF     ]     │
└─────────────────────────┘
```

- **Objetivo:** gerar o PDF certo, no escopo certo.
- **Componentes:** seleção única em rádio, botão primário.
- **CTA principal:** "Gerar PDF".
- **CTA secundário:** nenhum (tela de ação única).
- **Estado vazio (funcional):** "Nenhuma ficha técnica cadastrada ainda nesse módulo." — impede gerar PDF vazio.
- **Estado carregando:** botão com spinner durante a montagem do HTML/PDF (pode levar segundos).
- **Estado de erro:** mensagem original do erro de geração, se `expo-print` falhar.
- **Mensagem amigável:** a mensagem de "nenhuma ficha" já é redigida de forma direta e acionável.
- **Acessibilidade:** opções com `accessibilityRole="radio"` e estado selecionado anunciado.

---

## 4. Telas — V2 (planejadas)

### 4.1 Cadastro de insumo (Estoque)

```
┌─────────────────────────┐
│ ←  Novo insumo             │
│  ( Nome )( Categoria )    │
│  ( Unidade )( Cód. interno)│
│  ( Cód. de barras opc. )  │
│  ( Qtd. atual )( Qtd. mín)│
│  ( Fornecedor          )  │
│  [   Salvar insumo   ]    │
└─────────────────────────┘
```

- **Objetivo:** cadastrar um insumo que passará a ser selecionável nas fichas técnicas.
- **Componentes:** campos de texto/numéricos, botão primário.
- **CTA principal:** "Salvar insumo".
- **CTA secundário:** N/A.
- **Estado vazio:** lista de insumos vazia mostra "Nenhum insumo cadastrado ainda" + atalho para cadastrar o primeiro.
- **Estado carregando:** spinner no botão de salvar.
- **Estado de erro:** validação de campos obrigatórios (nome, unidade, quantidade mínima ≥ 0).
- **Mensagem amigável:** "Já existe um insumo com esse nome." (mesma lógica de deduplicação da conciliação da V1).
- **Acessibilidade:** teclado numérico (`keyboardType="decimal-pad"`) nos campos de quantidade.

### 4.2 Ficha técnica com CMV (V2)

```
┌─────────────────────────┐
│ ←  Editar ficha            │
│  ( Nome )                  │
│  Ingredientes               │
│  [Selecionar do estoque ▾] │
│  <Limão · 1 un · R$0,80>   │
│  ( item texto livre ) ✕    │
│                              │
│  Custo total:   R$ 4,20     │
│  CMV:           24%          │
│  Margem:        R$ 12,80     │
│  [   Salvar ficha    ]      │
└─────────────────────────┘
```

- **Objetivo:** o mesmo editor de ficha da V1, com seleção assistida de ingrediente do estoque e custo calculado em tempo real.
- **Componentes:** seletor de insumo do catálogo (com busca), linha de ingrediente com custo unitário exibido, painel de custo/CMV/margem.
- **CTA principal:** "Salvar ficha" (herdado da V1).
- **CTA secundário:** "Adicionar ingrediente em texto livre" (mantém compatibilidade com o fluxo da V1).
- **Estado vazio:** nenhum ingrediente vinculado ao estoque ainda → custo exibido como "R$ 0,00 (sem ingredientes vinculados ao estoque)".
- **Estado carregando:** recálculo do custo é local/instantâneo — não depende de rede a cada tecla.
- **Estado de erro:** insumo sem preço cadastrado (`package_price = 0`, caso de conciliação automática da V1) sinalizado visualmente como "sem custo definido", sem travar o restante do cálculo.
- **Mensagem amigável:** tooltip/texto explicando por que um ingrediente aparece "sem custo".
- **Acessibilidade:** valores monetários e percentuais sempre com rótulo textual (não só cor/ícone indicando "bom" ou "ruim").

### 4.3 Preço sugerido

```
┌─────────────────────────┐
│ ←  Preço sugerido           │
│  Custo da receita: R$ 4,20  │
│  ( CMV desejado: 30% )      │
│                              │
│  Mínimo:   R$ 14,00          │
│  Ideal:    R$ 15,90          │
│  Premium:  R$ 18,90          │
└─────────────────────────┘
```

- **Objetivo:** sugerir preço de venda a partir do custo já calculado.
- **Componentes:** campo numérico de CMV desejado, três cartões de resultado.
- **CTA principal:** nenhuma ação de salvar — é uma calculadora de consulta (o preço sugerido não é gravado automaticamente na ficha, evitando sobrescrever uma decisão comercial do proprietário sem confirmação).
- **CTA secundário:** "Usar este preço" (aplica o valor escolhido ao campo de preço de venda da ficha, mediante confirmação explícita).
- **Estado vazio:** sem custo de receita calculado ainda → tela orienta "Vincule ao menos um ingrediente do estoque para calcular o preço sugerido."
- **Estado carregando:** recálculo instantâneo, local.
- **Estado de erro:** CMV desejado fora de uma faixa plausível (ex.: 0% ou ≥ 100%) bloqueado por validação, com explicação.
- **Mensagem amigável:** "priCE" apresentado sempre já arredondado comercialmente (ex.: R$ 15,90, nunca R$ 15,87).
- **Acessibilidade:** os três valores (mínimo/ideal/premium) rotulados por texto, nunca só por posição/cor.

### 4.4 Equipe (convite de funcionário)

```
┌─────────────────────────┐
│ ←  Equipe                   │
│  <Roberto · Proprietário>  │
│  <Marina · Gerente     >   │
│  <Diego  · Convite pendente>│
│  [  + Adicionar funcionário ]│
└─────────────────────────┘
```

- **Objetivo:** gerenciar quem tem acesso ao estabelecimento e com qual papel.
- **Componentes:** lista de membros com papel e status, botão primário de convite.
- **CTA principal:** "+ Adicionar funcionário".
- **CTA secundário:** remover/editar papel de um membro existente (visível só a quem tem permissão — ver `09_SEGURANCA_LGPD.md`).
- **Estado vazio:** lista mostra só o próprio proprietário logo após o cadastro — não é tratado como "vazio" (sempre há ao menos um membro).
- **Estado carregando:** spinner ao enviar convite.
- **Estado de erro:** "Já existe um convite pendente para esse email."; email inválido bloqueado antes do envio.
- **Mensagem amigável:** status do convite sempre em texto claro ("Convite pendente", "Ativo", "Removido"), nunca só um ícone.
- **Acessibilidade:** ação destrutiva (remover funcionário) sempre com confirmação em duas etapas, como já ocorre na exclusão de conta da V1.

---

## 5. Telas — V3 (planejadas)

### 5.1 Registrar produção

```
┌─────────────────────────┐
│ ←  Nova produção            │
│  [ Selecionar ficha ▾ ]     │
│  ( Quantidade produzida )   │
│  Consumo previsto:           │
│  <Limão: -200g>              │
│  <Cachaça: -500ml>           │
│  [   Confirmar produção  ]  │
└─────────────────────────┘
```

- **Objetivo:** registrar o que foi efetivamente preparado, baixando o estoque dos insumos consumidos.
- **Componentes:** seletor de ficha, campo de quantidade, lista de consumo previsto.
- **CTA principal:** "Confirmar produção".
- **CTA secundário:** "Editar quantidade" de um insumo específico do consumo previsto (ajuste de perda no preparo, por exemplo).
- **Estado vazio:** nenhuma ficha vinculada ao estoque disponível → orienta a vincular ingredientes primeiro.
- **Estado carregando:** spinner ao confirmar (grava múltiplas movimentações de uma vez).
- **Estado de erro:** insumo insuficiente no estoque — aviso não bloqueante, decisão fica com o usuário.
- **Mensagem amigável:** "Estoque de Limão está baixo para essa quantidade. Deseja continuar mesmo assim?"
- **Acessibilidade:** lista de consumo com valores negativos sempre com o sinal "−" explícito, nunca só cor vermelha.

### 5.2 Dashboard

```
┌─────────────────────────┐
│  Dashboard                  │
│  Estoque: R$ 8.420,00        │
│  CMV médio: 28%              │
│  ⚠ 3 produtos críticos       │
│  Receita mais cara: Picanha  │
│  Drink + lucrativo: Caipirinha│
│  Compras do mês: R$ 2.100    │
│  Produção da semana: 340un   │
└─────────────────────────┘
```

- **Objetivo:** visão consolidada do negócio para o proprietário/gerente.
- **Componentes:** cartões de indicador, lista de produtos críticos.
- **CTA principal:** tocar num indicador para ver o detalhe (ex.: lista completa de produtos críticos).
- **CTA secundário:** filtrar por período.
- **Estado vazio:** dados insuficientes (estabelecimento novo) → indicadores mostram "Sem dados suficientes ainda" em vez de zero enganoso.
- **Estado carregando:** skeleton nos cartões enquanto os indicadores são calculados.
- **Estado de erro:** falha ao calcular um indicador específico não derruba o dashboard inteiro — só aquele cartão mostra "Não foi possível carregar".
- **Mensagem amigável:** indicadores sempre com unidade explícita (R$, %, un) — nunca um número solto sem contexto.
- **Acessibilidade:** cartões com texto suficiente para leitor de tela descrever o indicador e seu valor por extenso.

### 5.3 Lista de compras

```
┌─────────────────────────┐
│ ←  Lista de compras         │
│  ☐ Limão — 5kg (crítico)    │
│  ☐ Cachaça — 3un             │
│  ☑ Gelo — 10kg (comprado)   │
│  [  + Adicionar item  ]     │
│  [   Marcar comprados  ]    │
└─────────────────────────┘
```

- **Objetivo:** consolidar o que precisa ser comprado, a partir dos insumos críticos e de itens adicionados manualmente.
- **Componentes:** lista com checkbox por item, badge de "crítico", botão de adicionar item manual, botão de confirmar compra.
- **CTA principal:** "Marcar comprados" (dispara movimentação de Entrada para os itens marcados).
- **CTA secundário:** "+ Adicionar item" (item não crítico ainda, mas previsto pela equipe).
- **Estado vazio:** "Nenhum insumo crítico no momento — sua lista está em dia." (estado vazio positivo, não um erro).
- **Estado carregando:** spinner ao gerar a lista automática a partir do estoque.
- **Estado de erro:** item adicionado sem insumo correspondente no catálogo → orienta cadastrar o insumo primeiro.
- **Mensagem amigável:** badge "crítico" sempre acompanhado do texto da razão ("abaixo do mínimo"), nunca só a cor.
- **Acessibilidade:** checkboxes com `accessibilityRole="checkbox"` e estado (marcado/desmarcado) anunciado.
