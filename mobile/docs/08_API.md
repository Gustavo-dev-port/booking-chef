---
documento: "08 — API"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 08 — API

## Índice

1. [Nota de implementação](#1-nota-de-implementação)
2. [Auth](#2-auth)
3. [Recipes](#3-recipes-fichas-técnicas)
4. [Inventory (V2)](#4-inventory-v2)
5. [Movements (V2)](#5-movements-v2)
6. [Employees (V2)](#6-employees-v2)
7. [Booking / PDF](#7-booking--pdf)
8. [Convenção de erros](#8-convenção-de-erros)

---

## 1. Nota de implementação

O Booking Chef **não expõe uma API REST própria** — o app fala diretamente com o Supabase (Postgres + Auth + Storage + Edge Functions) via SDK. Este documento descreve o contrato de dados **como se fosse REST**, porque é a forma mais clara de comunicar request/response/erros/permissões entre times (mobile, backend, QA) — mas cada "endpoint" abaixo corresponde, na implementação real, a uma função de `src/features/<domínio>/api.ts` (ver `06_ARQUITETURA.md`), não a uma rota HTTP própria. Endpoints marcados **✅** já existem; marcados **🔜** são da V2/V3.

Toda requisição autenticada carrega o JWT da sessão no cabeçalho `Authorization: Bearer <token>` (gerenciado automaticamente pelo SDK, nunca manualmente pelo código do app) — nenhum endpoint abaixo tem um parâmetro explícito de "usuário atual"; ele é sempre resolvido a partir do token.

## 2. Auth

### `POST /login` ✅

| | |
|---|---|
| **Request** | `{ "email": "string", "password": "string" }` |
| **Response 200** | Sessão criada — token gerenciado internamente pelo SDK, sem payload explícito a tratar no client |
| **Erros** | `401` credenciais inválidas → *"Email ou senha incorretos."*; `403` email não confirmado → *"Confirme seu email antes de entrar."* |
| **Permissões** | Público (sem autenticação prévia) |

### `POST /register` ✅

| | |
|---|---|
| **Request** | `{ "email": "string", "password": "string (min 8)" }` |
| **Response 200** | `{ "needsEmailConfirmation": boolean }` |
| **Erros** | `409` email já cadastrado → *"Já existe uma conta com esse email."*; `422` senha curta |
| **Permissões** | Público |

### `POST /auth/logout` ✅

| | |
|---|---|
| **Request** | — |
| **Response 200** | Sessão encerrada |
| **Erros** | — |
| **Permissões** | Usuário autenticado |

### `POST /password/forgot` ✅

| | |
|---|---|
| **Request** | `{ "email": "string" }` |
| **Response 200** | Mensagem neutra — mesmo se o email não existir na base, por segurança |
| **Erros** | Falha genérica de envio |
| **Permissões** | Público |

### `POST /password/reset` ✅

| | |
|---|---|
| **Request** | `{ "password": "string (min 8)" }` — exige uma sessão de recuperação válida (originada do link do email) |
| **Response 200** | Senha atualizada; sessão de recuperação encerrada (logout automático) |
| **Erros** | `422` senha curta |
| **Permissões** | Sessão de recuperação (não é uma sessão normal) |

### `POST /onboarding` ✅

| | |
|---|---|
| **Request** | `{ "name", "phone?", "cnpj", "legalName", "tradeName?", "segment", "employeeRange", "city", "state", "termsAccepted": true, "marketingOptIn": boolean }` |
| **Response 200** | Perfil e empresa criados; usuário vinculado como `proprietario` |
| **Erros** | `422` CNPJ inválido; `409` CNPJ já cadastrado; `422` termos não aceitos |
| **Permissões** | Usuário autenticado, sem empresa vinculada ainda |

### `DELETE /account` ✅

| | |
|---|---|
| **Request** | — (usuário-alvo resolvido pelo token, nunca por parâmetro) |
| **Response 200** | Conta, empresa, fichas e fotos apagadas em cascata — irreversível |
| **Erros** | `500` falha na exclusão → *"Não foi possível excluir a conta. Tente novamente."* |
| **Permissões** | Usuário autenticado (qualquer papel pode excluir a própria conta; não exclui a empresa de outros membros — comportamento a refinar na V2 quando existir múltiplos usuários, ver `09_SEGURANCA_LGPD.md`) |

## 3. Recipes (fichas técnicas)

### `GET /recipes` ✅

| | |
|---|---|
| **Request** | Query: `type=bar\|cozinha` (obrigatório) |
| **Response 200** | `[{ id, name, category, type, photo_path, updated_at }]` — só fichas ativas |
| **Erros** | `401` sem sessão |
| **Permissões** | Todos os papéis que têm acesso ao módulo (`bartender`/`bartender_cozinha` só `bar`; `cozinheiro` só `cozinha`; `visualizador` em modo leitura — V2) |

### `GET /recipes/:id` ✅

| | |
|---|---|
| **Request** | — |
| **Response 200** | Ficha completa + array de ingredientes |
| **Response 404** | *"Ficha não encontrada."* |
| **Permissões** | Mesmas de `GET /recipes`, restrito ao módulo da ficha |

### `POST /recipes` ✅

| | |
|---|---|
| **Request** | `{ name, category?, yieldAmount?, glassType?, garnish?, finalWeight?, instructions?, notes?, ingredients: [{ ingredientName, quantity, unit }] }` |
| **Response 201** | `{ id: string }` |
| **Erros** | `422` nome ausente; `422` ingrediente com quantidade negativa ou unidade fora da lista fechada |
| **Permissões** | `proprietario`, `gerente`; `bartender`/`cozinheiro` só no próprio módulo (V2 — na V1, único papel existente é `proprietario`) |

### `PUT /recipes/:id` ✅

| | |
|---|---|
| **Request** | Mesmo corpo de `POST /recipes` |
| **Response 200** | Ficha atualizada; ingredientes substituídos por completo |
| **Erros** | `404` ficha não encontrada; `422` validação |
| **Permissões** | Mesmas de `POST /recipes` |

### `DELETE /recipes/:id` (arquivar) ✅

| | |
|---|---|
| **Request** | — |
| **Response 200** | `is_active = false` — nunca um `DELETE` físico |
| **Erros** | `404` |
| **Permissões** | `proprietario`, `gerente` |

### `POST /recipes/:id/photo` ✅

| | |
|---|---|
| **Request** | `multipart`: arquivo de imagem |
| **Response 200** | `{ photoPath: string }` |
| **Erros** | `413` arquivo grande demais (limite definido pelo picker, `quality: 0.7`); `500` falha de upload |
| **Permissões** | Mesmas de `PUT /recipes/:id` |

## 4. Inventory (V2) 🔜

### `GET /inventory/items` 🔜

| | |
|---|---|
| **Request** | Query opcional: `belowMinimum=true` (só itens críticos) |
| **Response 200** | `[{ id, name, category, unit, currentQuantity, minimumQuantity, unitCost, supplierId }]` |
| **Erros** | `401` |
| **Permissões** | `proprietario`, `gerente` (estoque não é visível para `bartender`/`cozinheiro`/`visualizador`) |

### `POST /inventory/items` 🔜

| | |
|---|---|
| **Request** | `{ name, category?, unit, internalCode?, barcode?, minimumQuantity, supplierId? }` |
| **Response 201** | `{ id: string }` |
| **Erros** | `409` insumo com nome duplicado na empresa; `422` unidade ausente |
| **Permissões** | `proprietario`, `gerente` |

### `PUT /inventory/items/:id` 🔜

| | |
|---|---|
| **Request** | Mesmo corpo de `POST`, mais `isActive?: boolean` |
| **Response 200** | Insumo atualizado — **nunca** altera `currentQuantity` diretamente (isso só acontece via `POST /inventory/movements`) |
| **Erros** | `404`; `422` |
| **Permissões** | `proprietario`, `gerente` |

## 5. Movements (V2) 🔜

### `POST /inventory/movements` 🔜

| | |
|---|---|
| **Request** | `{ itemId, type: "entrada"\|"saida"\|"ajuste"\|"perda"\|"producao", quantity (> 0), reason? }` |
| **Response 201** | `{ id: string, newBalance: number }` — saldo do insumo já recalculado |
| **Erros** | `422` quantidade ≤ 0; `404` insumo não encontrado |
| **Permissões** | `proprietario`, `gerente` (tipo `producao` também acessível a `bartender`/`cozinheiro` quando associado a um registro de produção do próprio módulo — V3) |

### `GET /inventory/items/:id/movements` 🔜

| | |
|---|---|
| **Request** | Query opcional: `from`, `to` (intervalo de data) |
| **Response 200** | `[{ id, type, quantity, reason, createdBy, createdAt }]`, cronológico, sem lacunas — nunca apagado |
| **Erros** | `404` |
| **Permissões** | `proprietario`, `gerente` |

## 6. Employees (V2) 🔜

### `GET /employees` 🔜

| | |
|---|---|
| **Request** | — |
| **Response 200** | `[{ id, name, email, role, status }]` |
| **Erros** | `401` |
| **Permissões** | `proprietario`, `gerente` (visão da própria equipe) |

### `POST /employees` (convite) 🔜

| | |
|---|---|
| **Request** | `{ name, email, role }` |
| **Response 201** | `{ id: string, status: "convidado" }` — dispara email de convite |
| **Erros** | `409` convite pendente já existe para esse email; `422` papel inválido |
| **Permissões** | `proprietario` (convidar), `gerente` só se explicitamente habilitado pela matriz RBAC da empresa (ver `09_SEGURANCA_LGPD.md`) |

### `PUT /employees/:id` 🔜

| | |
|---|---|
| **Request** | `{ role }` |
| **Response 200** | Papel atualizado |
| **Erros** | `404`; `403` tentativa de alterar o próprio papel (autoelevação bloqueada) |
| **Permissões** | `proprietario` |

### `DELETE /employees/:id` 🔜

| | |
|---|---|
| **Request** | — |
| **Response 200** | Acesso removido (`status = "removido"`) — conteúdo criado pela pessoa **permanece** |
| **Erros** | `404`; `403` tentativa de remover o próprio proprietário fundador (bloqueado) |
| **Permissões** | `proprietario` |

## 7. Booking / PDF

### `POST /booking/generate` ✅

| | |
|---|---|
| **Request** | `{ scope: "bar" \| "cozinha" \| "both" }` |
| **Response 200** | Arquivo PDF (gerado e processado localmente no dispositivo — não há payload de rede de resposta; a "resposta" é o arquivo entregue ao compartilhamento/impressão nativo do aparelho) |
| **Erros** | `422` nenhuma ficha ativa no escopo escolhido → *"Nenhuma ficha técnica cadastrada ainda nesse módulo."* |
| **Permissões** | Todo usuário autenticado com acesso ao(s) módulo(s) escolhido(s) |

## 8. Convenção de erros

Todo erro segue o mesmo padrão de duas camadas já em produção na V1: uma mensagem técnica (não exibida ao usuário) e uma mensagem traduzida para português claro, mapeada por uma tabela de tradução (`translateError`, ver `06_ARQUITETURA.md`). Novos endpoints (V2/V3) devem seguir a mesma convenção — nenhuma mensagem de erro de banco ou de rede deve chegar crua à interface.

| Código | Significado | Exemplo de mensagem ao usuário |
|---|---|---|
| `401` | Não autenticado | "Sua sessão expirou. Entre novamente." |
| `403` | Autenticado, mas sem permissão para a ação | "Você não tem permissão para esta ação." |
| `404` | Recurso não encontrado | "Ficha não encontrada." |
| `409` | Conflito (duplicidade) | "Já existe uma empresa cadastrada com esse CNPJ." |
| `422` | Validação falhou | Mensagem específica do campo, gerada pelo schema Zod correspondente |
| `500` | Falha inesperada do servidor/rede | "Algo deu errado. Tente novamente." |
