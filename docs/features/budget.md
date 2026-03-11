# Orcamento Mensal por Categoria

## Visao Geral
Permite ao usuario definir limites de gastos mensais por categoria, com acompanhamento de consumo e suporte a rollover (saldo nao utilizado acumula para o proximo mes).

## Entidades
- `Budget` — orcamento com limite, gasto, mes/ano, categoria e flag de rollover

## Regras de Dominio
- `budgetConsumption` — calcula percentual consumido (spent_cents / limit_cents)
- `budgetRemaining` — calcula saldo restante em centavos
- `shouldAlert` — retorna true quando consumo >= 80% ou 100%
- `calculateRollover` — soma saldo nao utilizado do mes anterior ao limite atual

## Storage
- SQLite via `expo-sqlite` (tabela: budgets)
- Constraint UNIQUE(user_id, category_id, month, year) para evitar duplicatas

## Telas
- `BudgetList` — lista de orcamentos do mes com progress bars
- `BudgetForm` — formulario de criacao/edicao (categoria + limite + rollover)

## Application Layer
- `createBudget` — valida e insere orcamento (usa upsert para update on conflict)
- `listBudgets` — lista orcamentos do mes/ano com calculo de rollover

## Testes
- 4 unit: createBudget (validacao, upsert, campos obrigatorios)
- 2 unit: listBudgets (lista por mes, lista vazia)
- 3 unit: budgetRules (consumo, rollover, alerta)

## Sync
- Mutations (upsert/delete) enfileiram automaticamente no sync_queue para sincronizacao com Supabase
