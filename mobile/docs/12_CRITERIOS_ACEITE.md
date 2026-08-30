---
documento: "12 — Critérios de Aceite"
produto: "Booking Chef"
versão: "1.0"
data: "30 de agosto de 2026"
---

# 12 — Critérios de Aceite

## Índice

1. [V1 — Autenticação e Conta](#1-v1--autenticação-e-conta)
2. [V1 — Fichas Técnicas](#2-v1--fichas-técnicas)
3. [V1 — Booking PDF](#3-v1--booking-pdf)
4. [V2 — Estoque (Épico 06)](#4-v2--estoque-épico-06)
5. [V2 — CMV e Precificação (Épico 07)](#5-v2--cmv-e-precificação-épico-07)
6. [V2 — Equipe e Permissões (Épico 08)](#6-v2--equipe-e-permissões-épico-08)

Formato **BDD** (Given / When / Then, em português: Dado / Quando / Então). Todo cenário aqui deve ter um teste automatizado correspondente antes de a história ser considerada concluída (ver critérios de qualidade em `mobile/docs/DOCUMENTACAO-BOOKING-CHEF.md`, capítulo 10).

---

## 1. V1 — Autenticação e Conta

### Login

```
Dado que sou um usuário com conta já criada
Quando informo o email e a senha corretos
Então entro no app e sou direcionado para a Home (se já tenho empresa cadastrada) ou para o onboarding (se não tenho)

Dado que sou um usuário com conta já criada
Quando informo uma senha incorreta
Então vejo a mensagem "Email ou senha incorretos." e permaneço na tela de login
```

### Criar conta e completar onboarding

```
Dado que não tenho conta no Booking Chef
Quando crio uma conta com email e senha válidos
Então recebo confirmação (por email, se o projeto exigir) e, ao confirmar, sou direcionado ao onboarding

Dado que estou no onboarding, com um CNPJ válido informado
Quando toco em "Buscar dados da empresa"
Então os campos de razão social, cidade e UF são preenchidos automaticamente, mas continuam editáveis

Dado que estou no onboarding
Quando tento concluir o cadastro sem aceitar os Termos de Uso
Então o botão de concluir permanece bloqueado e a exigência é comunicada claramente
```

### Recuperação de senha

```
Dado que esqueci minha senha
Quando informo meu email na tela "Esqueci minha senha"
Então recebo uma mensagem neutra de confirmação, independentemente de o email existir ou não na base

Dado que abri o link de recuperação de senha do meu email
Quando defino uma nova senha válida
Então a senha é atualizada e sou deslogado automaticamente, retornando à tela de login
```

### Excluir conta

```
Dado que sou um usuário autenticado
Quando escolho "Excluir minha conta" e confirmo a ação na segunda etapa de confirmação
Então minha conta, meu estabelecimento, minhas fichas técnicas e minhas fotos são apagados de forma permanente e irreversível

Dado que iniciei a exclusão de conta
Quando a operação falha por qualquer motivo
Então permaneço logado e vejo uma mensagem de erro clara, sem perder acesso à minha conta
```

## 2. V1 — Fichas Técnicas

### Criar ficha técnica

```
Dado que sou um usuário autenticado com uma empresa cadastrada
Quando preencho todos os campos obrigatórios de uma nova ficha técnica (nome e ao menos os campos exigidos pelo módulo) e salvo
Então a ficha é salva com sucesso e aparece na lista do módulo correspondente

Dado que estou criando uma ficha técnica
Quando tento salvar sem informar o nome
Então vejo a mensagem "Informe o nome" junto ao campo, e o salvamento não é enviado ao servidor

Dado que estou adicionando um ingrediente à ficha
Quando informo uma quantidade negativa
Então vejo a mensagem "Deve ser 0 ou mais" e não consigo salvar até corrigir
```

### Editar e arquivar ficha técnica

```
Dado que existe uma ficha técnica já cadastrada
Quando abro a ficha, altero um campo e salvo
Então as alterações são gravadas e refletidas na lista e no booking gerado a partir dali

Dado que estou editando uma ficha existente
Quando escolho "Arquivar ficha" e confirmo
Então a ficha deixa de aparecer na lista ativa, mas permanece preservada no histórico (nunca é apagada fisicamente)
```

## 3. V1 — Booking PDF

```
Dado que existe ao menos uma ficha técnica ativa no módulo escolhido
Quando gero o booking para esse módulo
Então recebo um PDF com capa, sumário e uma ficha por página, no formato A4, pronto para compartilhar ou imprimir

Dado que não existe nenhuma ficha técnica ativa no módulo escolhido
Quando tento gerar o booking desse módulo
Então vejo a mensagem "Nenhuma ficha técnica cadastrada ainda nesse módulo." e nenhum PDF é gerado
```

## 4. V2 — Estoque (Épico 06)

### Cadastro de insumo (06.1)

```
Dado que sou proprietário ou gerente
Quando cadastro um insumo com nome, categoria, unidade e quantidade mínima válidos
Então o insumo é salvo e aparece na lista de estoque com quantidade atual inicial zero

Dado que estou cadastrando um insumo
Quando informo uma quantidade mínima negativa
Então o campo é rejeitado com uma mensagem clara, e o insumo não é salvo até a correção
```

### Movimentação de estoque (06.2, 06.3)

```
Dado que existe um insumo cadastrado com saldo atual de 10 unidades
Quando lanço uma movimentação de Entrada de 5 unidades
Então o saldo atual passa a ser 15 unidades e a movimentação aparece no histórico com data, tipo e autor

Dado que existe um insumo com saldo atual de 3 unidades
Quando lanço uma movimentação de Saída de 5 unidades
Então o sistema permite a movimentação (o negócio real pode operar com saldo negativo temporário) mas sinaliza visualmente que o saldo ficou negativo, sem apagar ou impedir o registro

Dado que uma movimentação foi lançada por engano
Quando o usuário tenta "desfazer" a movimentação
Então o sistema não oferece exclusão — orienta o lançamento de uma movimentação de Ajuste para corrigir o saldo, preservando o histórico original
```

### Alerta de insumo crítico (06.4)

```
Dado que um insumo tem quantidade mínima definida como 5 e o saldo atual cai para 5 ou menos
Quando o gerente consulta a lista de insumos
Então esse insumo aparece destacado como "abaixo do mínimo"

Dado que um insumo estava abaixo do mínimo
Quando uma movimentação de Entrada eleva o saldo acima da quantidade mínima
Então o destaque de "abaixo do mínimo" desaparece automaticamente, sem ação manual adicional
```

## 5. V2 — CMV e Precificação (Épico 07)

### Seleção assistida de ingrediente (07.1)

```
Dado que estou editando uma ficha técnica e existe um insumo "Limão" cadastrado no estoque com custo unitário definido
Quando seleciono "Limão" a partir do catálogo do estoque na linha de ingrediente
Então a unidade e o custo unitário são preenchidos automaticamente, e eu só preciso informar a quantidade

Dado que quero usar um ingrediente que não está no catálogo de estoque
Quando digito o nome livremente, como na V1
Então a linha é aceita normalmente, mas contabilizada como custo R$ 0,00 no cálculo total, sinalizada como "sem custo vinculado"
```

### Cálculo de custo/CMV em tempo real (07.2)

```
Dado que uma ficha tem ingredientes vinculados ao estoque com custo definido
Quando altero a quantidade de um ingrediente
Então o custo total e o CMV% recalculam imediatamente na tela, sem exigir que eu salve a ficha primeiro

Dado que uma ficha tem preço de venda definido
Quando o custo total muda
Então o CMV%, o lucro bruto e a margem de contribuição são recalculados de acordo com as fórmulas documentadas em `01_PRD.md`/roadmap técnico
```

### Snapshot de custo (07.3)

```
Dado que uma ficha técnica tem um custo total calculado
Quando eu salvo a ficha
Então um registro de `recipe_cost_snapshot` é gravado com o custo, o CMV% e a data/hora daquele momento

Dado que o preço de um insumo mudou depois de uma ficha ter sido salva
Quando eu consulto o histórico de custo dessa ficha
Então o snapshot antigo permanece inalterado — o custo histórico não é recalculado retroativamente
```

### Preço sugerido (07.4)

```
Dado que uma ficha tem um custo total calculado
Quando informo um CMV desejado de 30%
Então vejo três valores sugeridos (mínimo, ideal e premium), cada um já arredondado para uma terminação comercial (ex.: R$ 15,90)

Dado que estou vendo o preço sugerido
Quando escolho "Usar este preço"
Então o valor é aplicado ao campo de preço de venda da ficha, mediante confirmação explícita — nunca de forma automática e silenciosa
```

## 6. V2 — Equipe e Permissões (Épico 08)

### Convite de funcionário (08.1, 08.2)

```
Dado que sou proprietário de um estabelecimento
Quando convido um funcionário informando nome, email e cargo
Então um convite é enviado para esse email, com o cargo já definido, e o funcionário não pode alterá-lo por conta própria

Dado que recebi um convite por email
Quando abro o link e crio minha senha
Então minha conta é automaticamente vinculada ao estabelecimento que me convidou, com o cargo definido no convite

Dado que já existe um convite pendente para um email
Quando alguém tenta convidar esse mesmo email novamente
Então o sistema informa "Já existe um convite pendente para esse email." e não duplica o convite
```

### Restrição de acesso por papel (08.3)

```
Dado que sou um usuário com papel "Bartender"
Quando acesso o app
Então vejo apenas a Cartilha de Drinks — nenhuma tela de Cozinha, Estoque, Equipe ou Configurações da empresa fica visível

Dado que sou um usuário com papel "Bartender"
Quando tento acessar uma URL/rota de Cozinha diretamente (por exemplo, por um link)
Então o acesso é bloqueado tanto pela interface quanto pela regra de RLS no banco — nunca só pela interface
```

### Remoção de acesso (08.4)

```
Dado que sou proprietário
Quando removo o acesso de um funcionário
Então essa pessoa não consegue mais entrar no app com aquela conta vinculada a este estabelecimento, mas as fichas técnicas e movimentações que ela criou permanecem no histórico, sem serem apagadas

Dado que estou removendo o acesso de um funcionário
Quando confirmo a ação
Então o sistema exige uma confirmação explícita antes de efetivar, da mesma forma que a exclusão de conta na V1
```
