---
documento: "03 — Jornada do Usuário"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 03 — Jornada do Usuário

## Índice

1. [Cadastro](#1-cadastro-✅-implementado)
2. [Login](#2-login-✅-implementado)
3. [Recuperação de senha](#3-recuperação-de-senha-✅-implementado)
4. [Criar ficha técnica (Cozinha)](#4-criar-ficha-técnica-cozinha-✅-implementado)
5. [Criar drink (Bar)](#5-criar-drink-bar-✅-implementado)
6. [Gerar PDF (Booking)](#6-gerar-pdf-booking-✅-implementado)
7. [Convidar funcionário](#7-convidar-funcionário-🔜-planejado-v2)
8. [Movimentar estoque](#8-movimentar-estoque-🔜-planejado-v2)
9. [Produção](#9-produção-🔜-planejado-v3)
10. [Lista de compras](#10-lista-de-compras-🔜-planejado-v3)

> Cada jornada é marcada com seu status real: **✅ Implementado** (código em produção, testado) ou **🔜 Planejado** (desenho de fluxo para orientar a implementação futura — sujeito a ajuste quando a V2/V3 entrar em desenvolvimento).

---

## 1. Cadastro (✅ Implementado)

```mermaid
flowchart TD
    A([Criar conta]) --> B[Email + senha + confirmação]
    B --> C["signUp (Supabase Auth)"]
    C --> D{Projeto exige\nconfirmação de email?}
    D -->|Sim| E["Confirme seu email"]
    E --> F[Usuário clica no link do email]
    F --> G[Sessão criada]
    D -->|Não| G
    G --> H[Onboarding: Complete seu cadastro]
    H --> I[Nome, telefone opcional]
    I --> J[CNPJ]
    J --> K["Buscar dados da empresa (BrasilAPI)"]
    K -->|Encontrado| L[Preenche razão social/cidade/UF]
    K -->|Não encontrado| M[Preenchimento manual]
    L --> N[Segmento + porte do negócio]
    M --> N
    N --> O[Aceite dos Termos — obrigatório]
    O --> P["create_company_with_owner() via RPC"]
    P --> Q[App liberado — usuário é proprietário]
```

## 2. Login (✅ Implementado)

```mermaid
flowchart TD
    A([Tela Entrar]) --> B[Email + senha]
    B --> C["signInWithPassword"]
    C --> D{Sucesso?}
    D -->|Sim| E{Tem perfil + empresa?}
    E -->|Não| F[Onboarding]
    E -->|Sim| G[Home]
    D -->|Não| H["Email ou senha incorretos."]
    H --> B
```

## 3. Recuperação de senha (✅ Implementado)

```mermaid
flowchart TD
    A([Esqueci minha senha]) --> B[Informa email]
    B --> C["resetPasswordForEmail"]
    C --> D["'Email enviado' (mensagem neutra,\nindependente de a conta existir)"]
    D --> E[Usuário abre o link do email]
    E --> F["Deep link de recuperação\n→ tela Nova senha"]
    F --> G[Nova senha + confirmação]
    G --> H["updatePassword()"]
    H --> I["Logout automático de propósito"]
    I --> J[Volta ao login com a senha nova]
```

## 4. Criar ficha técnica (Cozinha) (✅ Implementado)

```mermaid
flowchart TD
    A([Home]) --> B["Módulo Cozinha"]
    B --> C[Lista de fichas]
    C --> D["+ Criar ficha"]
    D --> E[Nome]
    E --> F["Ingredientes (texto livre):\nnome + quantidade + unidade"]
    F --> G[Categoria + Rendimento]
    G --> H[Peso final]
    H --> I[Modo de preparo]
    I --> J[Observações opcionais]
    J --> K[Foto opcional]
    K --> L["Salvar ficha → INSERT products + product_ingredients"]
    L --> M["Conciliação de insumos em segundo plano\n(base para CMV na V2)"]
    L --> N[Volta para a lista]
```

## 5. Criar drink (Bar) (✅ Implementado)

Mesmo editor de ficha da Cozinha, com os campos condicionais do Bar no lugar dos da Cozinha:

```mermaid
flowchart TD
    A([Home]) --> B["Módulo Bar"]
    B --> C[Lista de drinks]
    C --> D["+ Criar drink"]
    D --> E[Nome]
    E --> F["Ingredientes (texto livre):\nnome + quantidade + unidade"]
    F --> G[Categoria + Rendimento]
    G --> H["Copo utilizado"]
    H --> I["Decoração"]
    I --> J[Modo de preparo]
    J --> K[Observações opcionais]
    K --> L[Foto opcional]
    L --> M["Salvar ficha → INSERT products + product_ingredients"]
    M --> N[Volta para a lista]
```

## 6. Gerar PDF (Booking) (✅ Implementado)

```mermaid
flowchart TD
    A([Home]) --> B["Gerar Booking"]
    B --> C["Escolhe: Bar / Cozinha / Os dois"]
    C --> D["Gerar PDF"]
    D --> E{Alguma ficha\nencontrada?}
    E -->|Não| F["Erro: nenhuma ficha cadastrada\nnesse módulo"]
    E -->|Sim| G["Resolve URLs assinadas das fotos"]
    G --> H["Monta HTML: capa → sumário →\n1 ficha por página → rodapé"]
    H --> I["expo-print: HTML → PDF (A4)"]
    I --> J{Compartilhamento\ndisponível?}
    J -->|Sim| K[Menu de compartilhar/salvar/imprimir]
    J -->|Não| L[Diálogo de impressão direto]
```

## 7. Convidar funcionário (🔜 Planejado V2)

```mermaid
flowchart TD
    A["Proprietário/Gerente abre 'Equipe'"] --> B["'Adicionar funcionário'"]
    B --> C["Informa: Nome, Email, Cargo"]
    C --> D{Quem convida tem\npermissão de convidar?}
    D -->|Não| E["Ação bloqueada\n(RLS + UI — ver 09_SEGURANCA_LGPD.md)"]
    D -->|Sim| F["Convite enviado por email"]
    F --> G["Funcionário abre o link do convite"]
    G --> H["Cria senha"]
    H --> I["Conta vinculada automaticamente\nao estabelecimento, com o cargo do convite"]
    I --> J["Acessa o app com as permissões do seu papel"]
```

## 8. Movimentar estoque (🔜 Planejado V2)

```mermaid
flowchart TD
    A([Módulo Estoque]) --> B["Seleciona um insumo"]
    B --> C["Lançar movimentação"]
    C --> D{Tipo}
    D -->|Entrada| E["Compra recebida — soma ao saldo"]
    D -->|Saída| F["Venda/uso avulso — subtrai do saldo"]
    D -->|Ajuste| G["Correção após contagem física"]
    D -->|Perda| H["Vencimento/quebra/descarte — subtrai"]
    D -->|Produção| I["Consumo por receita preparada — ver jornada 9"]
    E --> J["Registra histórico (created_by, data, motivo)"]
    F --> J
    G --> J
    H --> J
    I --> J
    J --> K{Saldo ficou ≤\nquantidade mínima?}
    K -->|Sim| L["Insumo sinalizado como crítico\n(lista + dashboard, V3)"]
    K -->|Não| M["Saldo atualizado normalmente"]
```

## 9. Produção (🔜 Planejado V3)

```mermaid
flowchart TD
    A([Módulo Produção]) --> B["Seleciona a ficha técnica preparada"]
    B --> C["Informa a quantidade produzida"]
    C --> D["Sistema calcula o consumo de\ncada ingrediente da ficha × quantidade"]
    D --> E{Estoque suficiente\npara todos os insumos?}
    E -->|Não| F["Aviso: insumo insuficiente\n(usuário decide se continua ou ajusta)"]
    E -->|Sim| G["Confirma a produção"]
    F --> G
    G --> H["Gera movimentação tipo 'Produção'\npara cada insumo consumido"]
    H --> I["Saldo de estoque atualizado"]
    I --> J["Registro de produção fica no histórico\n(base para 'produção da semana' no dashboard)"]
```

## 10. Lista de compras (🔜 Planejado V3)

```mermaid
flowchart TD
    A([Módulo Estoque]) --> B["'Gerar lista de compras'"]
    B --> C["Sistema sugere insumos com\nsaldo ≤ quantidade mínima"]
    C --> D["Usuário revisa e ajusta quantidades"]
    D --> E["Adiciona itens manualmente, se necessário\n(insumo não crítico ainda, mas previsto)"]
    E --> F["Salva a lista de compras"]
    F --> G{Compra realizada?}
    G -->|Sim| H["Marca itens como comprados\n→ dispara movimentação de Entrada (jornada 8)"]
    G -->|Não ainda| I["Lista permanece pendente,\nconsultável a qualquer momento"]
```
