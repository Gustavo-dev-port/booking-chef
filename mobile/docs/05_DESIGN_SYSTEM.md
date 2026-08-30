---
documento: "05 — Design System"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 05 — Design System

## Índice

1. [Nota de reconciliação com a V1 implementada](#1-nota-de-reconciliação-com-a-v1-implementada)
2. [Cores](#2-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento (base 8)](#4-espaçamento-base-8)
5. [Componentes](#5-componentes)
6. [Regras de consistência](#6-regras-de-consistência)

---

## 1. Nota de reconciliação com a V1 implementada

Este documento define a **paleta e o sistema-alvo** solicitado para a marca Booking Chef (primária verde escuro, secundária laranja). A V1 já implementada usa, hoje, a paleta padrão do Tailwind/NativeWind sem customização (primária azul — documentado em `mobile/docs/DOCUMENTACAO-BOOKING-CHEF.md`, capítulo 7). As duas coisas **não são contraditórias**: o código da V1 não precisa ser reescrito para este documento ter valor — ele é o alvo para o próximo ciclo de UI (rebrand), e a tabela de migração abaixo mostra como aplicar a troca com o menor atrito possível, já que o app foi construído com token de cor centralizado (`COLORS` em `PrimaryButton`, classes NativeWind) e não cores espalhadas soltas pelo código.

| Token do sistema-alvo | Cor da V1 hoje | Ação de migração |
|---|---|---|
| Primária (verde escuro) | Azul (`blue-600`) | Trocar o valor do token primário — como a V1 usa um único ponto de definição de cor por componente (capítulo 7 da doc técnica), a troca é mecânica, não estrutural |
| Info | — (não existia como token separado) | O azul atual (`blue-600`) **vira** o tom de "Info" do sistema-alvo — reaproveitado, não descartado |
| Erro / Aviso / Neutras | `red-600` / `amber-*` / escala `gray-*` | Já compatíveis — mantidos sem alteração |

## 2. Cores

### 2.1 Primária — Verde escuro (gastronomia)

| Tom | Hex | Uso |
|---|---|---|
| `primary-900` | `#0B2E23` | Texto sobre fundo claro em alto contraste, hover de elementos escuros |
| `primary-700` | `#123F30` | Fundo escuro de destaque (headers de seção, cards em dark mode) |
| `primary-600` | `#1B5E42` | **Cor base da marca** — botão primário, ícone ativo, elemento selecionado |
| `primary-500` | `#227A54` | Estado pressionado/hover do botão primário |
| `primary-100` | `#DCEFE4` | Fundo suave (chips selecionados em modo claro, destaque leve) |
| `primary-50` | `#F1F8F4` | Fundo muito suave (faixas de destaque, hover sutil) |

### 2.2 Secundária — Laranja

| Tom | Hex | Uso |
|---|---|---|
| `secondary-700` | `#B85C00` | Texto/ícone laranja em alto contraste |
| `secondary-600` | `#E07A1E` | **Cor base secundária** — CTA de destaque alternativo, badges de atenção não-crítica (ex.: "Convite pendente") |
| `secondary-500` | `#F0902F` | Estado pressionado/hover |
| `secondary-100` | `#FCE8D2` | Fundo suave (badge, destaque leve) |

### 2.3 Neutras — Cinzas

Reaproveita a mesma escala neutra já validada na V1 (Tailwind `gray`), por continuidade visual e por já ter par claro/escuro definido em todo componente existente:

| Tom | Uso |
|---|---|
| `gray-50` / `gray-950` | Fundo secundário (listas, dashboard) — claro/escuro |
| `gray-100` / `gray-800` | Placeholder de imagem, fundo de elemento inativo |
| `gray-200` / `gray-700` | Bordas de card |
| `gray-300` / `gray-700` | Bordas de input |
| `gray-400` / `gray-500` | Texto desabilitado, placeholder de campo |
| `gray-500` / `gray-400` | Texto secundário |
| `gray-700` / `gray-300` | Rótulo de campo |
| `gray-900` / `gray-50` | Texto principal |
| `white` / `gray-900` | Fundo primário (telas de formulário) |

### 2.4 Estados

| Estado | Hex | Uso |
|---|---|---|
| Sucesso | `#16A34A` (verde) | Confirmação de ação concluída (ex.: "Ficha salva", badge "Comprado") — deliberadamente um verde **diferente** do verde da marca, para não confundir "isto é a cor da marca" com "isto deu certo" |
| Erro | `#DC2626` (vermelho) | Validação, ação destrutiva, falha de operação — já em uso na V1, mantido |
| Aviso | `#D97706` (âmbar) | Estoque crítico, texto de placeholder/atenção — tom já usado na V1 (`amber-*`), mantido |
| Info | `#2563EB` (azul) | Links, dica informativa, seleção neutra — herdado da cor primária atual da V1 (ver §1) |

**Regra de contraste:** todo par texto/fundo desta paleta precisa atingir contraste mínimo **AA** (4.5:1 para texto normal, 3:1 para texto grande/ícone) — os pares claro/escuro acima já foram escolhidos com essa margem; qualquer combinação nova (ex.: texto branco sobre `secondary-500`) deve ser validada antes de entrar em produção.

## 3. Tipografia

Sem fonte customizada — fonte padrão do sistema em cada plataforma (mesma decisão da V1, por leveza e por não exigir carregamento de asset). Hierarquia por tamanho e peso:

| Nível | Tamanho | Peso | Uso |
|---|---|---|---|
| H1 | 28–30px | Bold (700) | Título de tela |
| H2 | 22px | Semibold (600) | Título de seção dentro de uma tela |
| H3 | 18px | Semibold (600) | Subtítulo, cabeçalho de card grande |
| Body | 16px | Regular (400) / Semibold em ênfase | Texto de campo, botão, corpo de lista — nunca menor que isso em texto interativo |
| Caption | 13–14px | Regular (400) | Hint, texto de apoio, categoria, rodapé, timestamp |

## 4. Espaçamento (base 8)

Toda medida de espaçamento (margem, preenchimento, gap) é múltiplo de 8px, com 4px como único meio-passo permitido (para ajustes finos como o espaço entre rótulo e campo):

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Meio-passo — rótulo → campo, ícone → texto adjacente |
| `space-2` | 8px | Espaço mínimo entre elementos relacionados (chips, botões lado a lado) |
| `space-3` | 16px | Padding interno de card, gap padrão entre campos |
| `space-4` | 24px | Espaço entre blocos dentro de uma tela |
| `space-5` | 32px | Margem lateral de tela em telas mais respiradas |
| `space-6` | 40px | Separação entre seções distintas |
| `space-7` | 48px | Espaço acima do título principal (compensando header customizado) |
| `space-8` | 64px | Espaçamento de destaque (ex.: telas de estado vazio, onboarding) |

Raio de borda, em três níveis fixos (mesma convenção da V1): **12px** (inputs, botões) < **16px** (cards) < **9999px/total** (chips, badges, FAB).

## 5. Componentes

### 5.1 Botão

| Variante | Aparência | Uso |
|---|---|---|
| Primário sólido | Fundo `primary-600`, texto branco | Ação principal da tela |
| Secundário sólido | Fundo `secondary-600`, texto branco | Ação de destaque alternativo (pouco usada — reservar para não competir com o primário) |
| Outline | Borda 2px na cor do tom, texto na cor do tom, fundo transparente | Ação secundária |
| Texto/link | Sem borda nem fundo, texto na cor `info` | Ação terciária (ex.: "Esqueci minha senha") |
| Perigo | Fundo/borda `#DC2626` | Ação destrutiva (excluir conta, remover funcionário) |

Todas as variantes: altura mínima 44px, `border-radius: 12px`, padding horizontal 24px/vertical 12px, estado de `loading` (spinner substitui o texto) e `disabled` (opacidade 50%).

### 5.2 Input

Rótulo acima (Caption/Body), campo com altura mínima 44px, `border-radius: 12px`, borda `gray-300`/`gray-700` (borda `#DC2626` em erro). Mensagem de erro **substitui** o hint quando presente — nunca os dois ao mesmo tempo.

### 5.3 Card

`border-radius: 16px`, borda `gray-200`/`gray-700`, fundo `white`/`gray-900`, padding interno `space-3` (16px). Dois formatos: card de módulo (ícone + título + subtítulo, centralizado) e card de item de lista (miniatura + título + metadado, em linha).

### 5.4 Modal

Usado para seleções curtas que não justificam uma tela dedicada (ex.: seletor de unidade) — abre como folha (`bottom sheet`) de baixo para cima, `border-radius: 16px` só no topo, fundo semitransparente escuro (`rgba(0,0,0,0.4)`) atrás. Fechamento por toque fora da folha ou por seleção de uma opção.

### 5.5 FAB (Floating Action Button)

Botão circular de 56×56px, fundo `primary-600`, ícone/símbolo branco, posicionado no canto inferior direito com margem de `space-3` (16px) das bordas da tela. Reservado para a ação de criação mais frequente da tela (ex.: nova ficha, novo insumo) — nunca mais de um FAB por tela.

### 5.6 Bottom Navigation

**Não existe na V1** (a V1 usa a Home como hub central de navegação, com `Stack` e cabeçalho customizado — ver `06_ARQUITETURA.md`). Passa a ser recomendado a partir da V2, quando o número de destinos de primeiro nível cresce (Home, Estoque, Equipe, Dashboard, Perfil) o suficiente para justificar uma barra fixa: até 5 itens, ícone + rótulo curto, item ativo destacado em `primary-600`, os demais em `gray-500`/`gray-400`. Nenhum item deve depender só de cor para indicar o estado ativo — sempre reforçado por peso de fonte ou preenchimento do ícone.

### 5.7 Search Bar

Campo de busca com altura mínima 44px, `border-radius: 12px`, ícone de lupa à esquerda (texto "🔍" ou símbolo equivalente, consistente com a decisão de não usar biblioteca de ícones — ver `06_ARQUITETURA.md`), placeholder descritivo ("Buscar por nome"), sem botão de busca separado — filtra a lista conforme o usuário digita.

### 5.8 Avatar

Círculo de 40px (lista) ou 56px (perfil/detalhe), com foto do usuário quando existir ou, na ausência dela, as iniciais do nome sobre fundo `primary-100`/texto `primary-700`. Necessário a partir da V2 (tela Equipe, capítulo 4 de `04_UX_GUIDELINES.md`) para diferenciar membros da equipe visualmente.

### 5.9 Badge

Pílula pequena (`border-radius` total), texto Caption (13px) semibold, padding horizontal 8px/vertical 2px. Cores por significado, nunca por decoração:

| Badge | Cor de fundo | Cor de texto | Exemplo |
|---|---|---|---|
| Sucesso/ativo | `#DCFCE7` (verde claro) | `#16A34A` | "Ativo", "Comprado" |
| Aviso/pendente | `secondary-100` | `secondary-700` | "Convite pendente" |
| Crítico | `#FEE2E2` (vermelho claro) | `#DC2626` | "Estoque crítico" |
| Neutro | `gray-100`/`gray-800` | `gray-700`/`gray-300` | Contagem, categoria |

## 6. Regras de consistência

1. Nenhuma cor "solta" (hex direto) fora dos tokens definidos neste documento.
2. Todo elemento tocável tem no mínimo 44×44px.
3. Toda cor tem par claro/escuro definido antes de entrar em produção — não existe componente "só modo claro".
4. Um componente novo (não listado em §5) só é criado quando reutilizado por mais de uma tela; se for específico de uma tela, fica nela.
5. Estado (erro, sucesso, seleção, ativo) nunca é comunicado só por cor — sempre reforçado por texto, ícone ou peso de fonte, para acessibilidade a daltonismo e leitores de tela.
6. Título de tela é sempre H1; nenhuma tela usa um tamanho de fonte fora da escala de §3.
