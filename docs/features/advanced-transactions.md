# Transações Avançadas

## Visão Geral
Editar, excluir transações e suporte a recorrência e parcelamento.

## Regras de Domínio
- `generateInstallments` — divide valor total em N parcelas mensais, distribui centavos restantes nas primeiras parcelas
- `generateRecurringTransactions` — gera transações entre start/end date com frequência daily/weekly/monthly/yearly
- `validateTransactionEdit` — valida campos antes de edição
- `computeBalanceImpact` — calcula impacto no saldo de uma edição ou exclusão

## Storage
- `TransactionRepository` (SQLite) — CRUD com suporte a batch insert, filtros por mês/conta, delete por grupo de parcelas ou regra recorrente

## Testes
- 11 unit: installments (geração, divisão, remainder, boundary)
- 10 unit: recurring (monthly, weekly, yearly, edge cases)
- 5 unit: editDeleteRules (validação, impacto no saldo)
