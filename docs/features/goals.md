# Metas Financeiras

## Visao Geral
Permite ao usuario criar metas de poupanca com valor alvo, prazo opcional, contribuicoes incrementais e acompanhamento de progresso. Metas sao automaticamente marcadas como concluidas ao atingir o valor alvo.

## Entidades
- `Goal` — meta com target_cents, current_cents, status (active/completed/cancelled/paused), target_date, cor e icone

## Regras de Dominio
- `goalProgress` — calcula percentual de progresso (capped em 100%)
- `goalRemaining` — calcula valor restante em centavos
- `monthlyProjection` — calcula valor mensal necessario para atingir meta no prazo
- `isGoalDelayed` — detecta se prazo passou sem meta atingida
- `daysUntilTarget` — calcula dias restantes ate a data alvo

## Application Layer
- `createGoal` — valida e cria meta (nome obrigatorio, target > 0)
- `contributeToGoal` — adiciona valor a meta ativa, auto-completa se target atingido
- `listGoals` — lista metas do usuario, filtro opcional por status

## Storage
- SQLite via `expo-sqlite` (tabela: goals)
- Sync automatico via enqueueChange no GoalRepository

## Telas
- `GoalList` — lista de metas com barra de progresso, status, botao de contribuicao e modal de valor
- `GoalForm` — formulario de criacao (nome, valor alvo, data alvo opcional)
- Acesso via icone target no header do Dashboard

## Testes
- 15 unit: goalRules (progress, remaining, projection, delay, daysUntil)
- 5 unit: createGoal (validacao, campos default, custom color/icon)
- 6 unit: contributeToGoal (contribuicao, auto-complete, validacoes, not found, not active)
