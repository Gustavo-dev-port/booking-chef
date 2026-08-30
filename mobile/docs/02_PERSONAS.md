---
documento: "02 — Personas"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 02 — Personas

## Índice

1. [Proprietário de Bar](#1-proprietário-de-bar--roberto)
2. [Chef de Cozinha](#2-chef-de-cozinha--marina)
3. [Bartender](#3-bartender--diego)
4. [Gerente](#4-gerente--patrícia)
5. [Cozinheiro](#5-cozinheiro--joão)
6. [Matriz-resumo](#6-matriz-resumo)

---

## 1. Proprietário de Bar — "Roberto"

| Atributo | Descrição |
|---|---|
| Idade | 42 anos |
| Papel no app | `proprietario` (acesso total — capítulo de Segurança) |
| Objetivos | Saber quanto cada drink e prato realmente custa; ter um material de apresentação profissional para mostrar a investidores, franqueados ou avaliadores de crédito; não depender de uma pessoa específica para saber "como se faz" cada item do cardápio. |
| Dores | Preço definido "no olho", sem cálculo; perde tempo formatando planilha em vez de cuidar do salão; já perdeu uma receita quando um funcionário-chave saiu. |
| Conhecimento tecnológico | Baixo a médio — usa WhatsApp, Instagram e um PDV simples; qualquer fluxo com mais de 3 passos ou vocabulário técnico o afasta. |
| Necessidades | Onboarding rápido sem preencher CNPJ na mão; visão geral do negócio sem precisar entender banco de dados; confiança de que os dados estão seguros e que pode excluir a conta se decidir sair. |
| Fluxo principal no app | Cadastro do estabelecimento → convida a equipe (V2) → acompanha custo/CMV das receitas cadastradas pela equipe → gera booking para treinar novos funcionários e apresentar o cardápio. |

## 2. Chef de Cozinha — "Marina"

| Atributo | Descrição |
|---|---|
| Idade | 35 anos |
| Papel no app | `gerente` ou `bartender_cozinha`/`cozinheiro` (V2), dependendo do porte da casa |
| Objetivos | Padronizar o modo de preparo de cada prato, para que qualquer cozinheiro da equipe consiga reproduzir com fidelidade; controlar peso final e rendimento, para consistência de porção. |
| Dores | Receita "na cabeça" ou em pedaços de papel na cozinha; variação de qualidade quando um cozinheiro diferente prepara o mesmo prato; dificuldade de calcular o custo real de um prato com muitos ingredientes. |
| Conhecimento tecnológico | Médio — confortável com celular no dia a dia, mas sem paciência para telas longas ou formulários complexos no meio do turno. |
| Necessidades | Cadastrar uma ficha rapidamente, com poucos campos obrigatórios; foto do prato finalizado para referência visual; campo de peso final e modo de preparo numerado. |
| Fluxo principal no app | Entra no módulo Cozinha → cria/edita ficha técnica (nome, ingredientes, peso final, modo de preparo, foto) → consulta o CMV da receita quando o estoque estiver vinculado (V2). |

## 3. Bartender — "Diego"

| Atributo | Descrição |
|---|---|
| Idade | 28 anos |
| Papel no app | `bartender_cozinha` (V2) — acesso só à Cartilha de Drinks |
| Objetivos | Ter uma referência rápida e confiável de cada drink (copo, decoração, dose de cada ingrediente), especialmente para receitas autorais que não são óbvias; treinar novos bartenders sem precisar repetir a explicação verbalmente toda vez. |
| Dores | Errar a dose de um drink autoral por lembrar errado; decoração inconsistente entre turnos diferentes; falta de um material físico para consulta rápida durante o serviço. |
| Conhecimento tecnológico | Médio-alto — costuma ser o público mais à vontade com apps entre os cargos operacionais, mas ainda assim quer uma tela rápida de consultar em pé, no meio do balcão. |
| Necessidades | Lista de fichas do módulo Bar com busca rápida; ficha técnica clara sobre copo/decoração/preparo; booking em PDF para deixar impresso atrás do bar. |
| Fluxo principal no app | Entra no módulo Bar → consulta/cria ficha técnica de drink → usa o booking impresso como referência rápida durante o turno. |

## 4. Gerente — "Patrícia"

| Atributo | Descrição |
|---|---|
| Idade | 38 anos |
| Papel no app | `gerente` (estoque, Bar, Cozinha, criar/editar fichas — sem excluir a empresa) |
| Objetivos | Ter visão consolidada de Bar e Cozinha ao mesmo tempo; acompanhar estoque e evitar ruptura (faltar insumo no meio do serviço); apoiar o proprietário na decisão de preço. |
| Dores | Circula entre bar e cozinha e precisa alternar de contexto o tempo todo; hoje não tem visibilidade de estoque em tempo real; decisões de reposição são reativas ("só percebe quando falta"). |
| Conhecimento tecnológico | Médio-alto — geralmente é quem, na equipe, mais rapidamente adota uma ferramenta nova e ajuda os demais a usar. |
| Necessidades | Alternar rapidamente entre os dois módulos; alerta de insumo abaixo do mínimo (V2/V3); permissão para editar fichas dos dois módulos sem depender do proprietário para tudo. |
| Fluxo principal no app | Alterna entre Bar e Cozinha conforme a necessidade do turno → lança/ajusta movimentações de estoque (V2) → acompanha indicadores no dashboard (V3). |

## 5. Cozinheiro — "João"

| Atributo | Descrição |
|---|---|
| Idade | 24 anos |
| Papel no app | `cozinheiro` (V2) — acesso só às Fichas Técnicas da Cozinha |
| Objetivos | Seguir a receita certa sem depender de perguntar ao chef a cada dúvida; entender exatamente a quantidade e a ordem de preparo. |
| Dores | Instrução verbal que se perde ou é lembrada de forma diferente por pessoas diferentes; sem acesso a nada além do que precisa (não quer, nem deveria, se preocupar com estoque ou financeiro). |
| Conhecimento tecnológico | Baixo a médio — pode ser o primeiro emprego formal, ou a primeira vez usando um app de trabalho; textos e fluxos precisam ser diretos, sem jargão. |
| Necessidades | Tela simples, direta, com o modo de preparo bem legível; nenhuma opção ou informação que não seja da Cozinha visível para não confundir. |
| Fluxo principal no app | Entra direto no módulo Cozinha (não vê o resto) → consulta a ficha da receita do dia → segue o modo de preparo passo a passo. |

## 6. Matriz-resumo

| Persona | Conhecimento tecnológico | Módulos que usa | Necessidade central |
|---|---|---|---|
| Roberto (Proprietário) | Baixo–médio | Todos + Equipe + Financeiro (CMV/preço) | Confiança e visão geral, sem complexidade |
| Marina (Chef) | Médio | Cozinha (+ Bar, se acumular função) | Padronização e consistência de receita |
| Diego (Bartender) | Médio–alto | Bar | Consulta rápida e confiável durante o turno |
| Patrícia (Gerente) | Médio–alto | Bar + Cozinha + Estoque + Dashboard | Visão consolidada, sem ruptura de insumo |
| João (Cozinheiro) | Baixo–médio | Só Cozinha | Simplicidade radical, zero ruído |

Esta matriz é a base de decisão de UX documentada em `04_UX_GUIDELINES.md` (por que cada tela prioriza clareza sobre densidade de informação) e da matriz RBAC documentada em `09_SEGURANCA_LGPD.md`.
