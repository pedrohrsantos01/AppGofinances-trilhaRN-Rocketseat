# Changelog

## Release 1 - Base Robusta

### Fase 0 - Fundacao e Infraestrutura
- Jest + @testing-library/react-native configurados com jest-expo
- ESLint flat config + Prettier + Husky v9 + lint-staged
- Modelos de dominio normalizados (Transaction, Account, CreditCard, Invoice, Budget, Goal, Reminder)
- AppError tipado com codigos de erro
- Money value object (cents-based)
- Migracao de arquitetura para feature-based (domain/application/infra/presentation)
- Migracao de AsyncStorage para expo-sqlite
- GitHub Actions CI/CD (pr-gate + nightly)

### 1. Contas e Cartoes
- Entidade Account com tipos (cash, checking, savings, investment)
- CreditCard com fatura mensal e regras de fechamento/vencimento
- Invoice com status (open/closed/paid/partially_paid/overdue)
- calculateAccountBalance, calculateInvoiceTotal, getInvoiceStatus
- Conta default "Carteira" criada automaticamente
- Telas: AccountList, AccountForm
- Testes: 27 unit (balance, invoice rules, reconciliacao)

### 2. Transacoes Avancadas
- Edicao e exclusao de transacoes (swipe-to-delete + tap-to-edit)
- Parcelamento com generateInstallments
- Recorrencia com generateRecurringTransactions (daily/weekly/monthly/yearly)
- Seletor de conta no formulario de cadastro
- Seletor de modo (simples/parcelado/recorrente)
- FlatList otimizada (removeClippedSubviews, maxToRenderPerBatch, windowSize)
- Substituicao de react-native-iphone-x-helper por APIs nativas

### 3. Orcamento Mensal por Categoria
- Budget entity com limite, gasto, rollover
- createBudget, listBudgets com calculo de rollover
- budgetConsumption, shouldAlert (80%/100%)
- Telas: BudgetList com progress bars, BudgetForm
- Testes: 9 unit (create, list, regras)

### 4. Calendario Financeiro e Lembretes
- Reminder entity com recorrencia e notificacao
- expo-notifications com lazy dynamic import (Expo Go safe)
- createReminder, getUpcomingDues, calculateUpcomingDues
- Telas: ReminderList, ReminderForm
- Testes: 7 unit (create, upcoming, scheduling)

### 5. Importacao/Exportacao CSV
- Parser CSV com normalizacao de valores BR (R$ 1.500,30 -> 150030)
- Mapeamento de colunas configuravel
- Exportacao para CSV com expo-file-system + expo-sharing
- Deduplicacao por hash
- Tela: ImportExportScreen
- Testes: 12 unit (parser, import, export)

### 6. Sync Cloud MVP (Supabase)
- @supabase/supabase-js integrado com AsyncStorage para sessao
- Sync queue local (SyncQueueRepository) com retry
- Push/pull bidirecional por entidade
- Conflict resolution por version + updated_at (server wins on tie)
- Repositories auto-enqueue mutations (transactions, accounts, budgets, reminders)
- useSyncStore (Zustand) com estado de sync
- Tela: SyncScreen acessivel via icone cloud no Dashboard
- Testes: 17 unit (queue, merge, push/pull, store)

### Zustand Migration
- useTransactionStore (Dashboard state + business logic)
- useResumeStore (Resume aggregation logic)
- useAccountStore (Account list + selection)
- useSyncStore (Sync state + actions)

### Metricas
- 254 testes, 32 suites, 5 snapshots
- 0 erros TypeScript, 0 erros ESLint
- Coverage: 87%+ no escopo testavel
