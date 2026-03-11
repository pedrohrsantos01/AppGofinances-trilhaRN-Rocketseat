# Changelog

## Release 2 - Automacao e Diferenciacao

### 1. Metas Financeiras
- Goal entity com progresso, projecao mensal e deteccao de atraso
- createGoal, contributeToGoal com auto-complete ao atingir target
- goalProgress, goalRemaining, monthlyProjection, isGoalDelayed, daysUntilTarget
- GoalRepository com sync_queue integration
- Telas: GoalList com modal de contribuicao, GoalForm
- Testes: 26 unit (15 domain + 5 create + 6 contribute)

### 2. Insights Automaticos
- Deteccao de despesas recorrentes (3+ meses, <10% variacao)
- Anomalias de gasto (>50% acima da media historica por categoria)
- Tendencia por categoria (up/down/stable com threshold de 5%)
- generateInsights orquestra todas as analises a partir do historico
- Tela: InsightList com cards coloridos por severidade (info/warning/alert)
- Testes: 22 unit (17 domain + 5 application)

### 3. Open Finance Brasil
- OpenFinanceConnection entity com gestao de consentimento
- mapProviderTransaction (CREDIT/DEBIT -> income/expense, decimal -> cents)
- isConsentValid, needsConsentRenewal (7 dias), deduplicateImported
- OpenFinanceProvider interface + StubOpenFinanceProvider
- syncOpenFinance application layer com deduplicacao
- Testes: 15 unit (mapeamento, consentimento, deduplicacao)
- Nota: integracao real requer credenciais do Banco Central

### 4. Previsao de Fluxo de Caixa
- detectRecurringPatterns (via recurring_rule_id, 2+ ocorrencias)
- projectRecurring e projectInstallments para projecao futura
- buildProjection com periodos 30/60/90 dias
- getCashFlowProjection integra AccountRepo + TransactionRepo
- Tela: CashFlowScreen com saldo atual + cards por periodo
- Testes: 20 unit (15 domain + 5 application)

### 5. Compartilhamento Opcional
- SharedAccess entity com roles (owner/editor/viewer) e status (pending/accepted/revoked)
- canUserRead, canUserEdit, isOwner, validateInvite, getActiveShares
- inviteUser com validacao de email e prevencao de duplicatas
- revokeAccess para remover permissoes
- SharedAccessRepository via Supabase (feature cloud-only)
- Tela: SharingScreen com convite por email e gerenciamento
- Testes: 23 unit (18 domain + 5 application)

### Dashboard Header
- Icones de acesso rapido: trending-up (cashflow), zap (insights), target (goals), cloud (sync), users (sharing), power (logout)

### Metricas Release 2
- 365 testes, 42 suites, 5 snapshots
- 0 erros TypeScript, 0 erros ESLint
- 14 features implementadas, 11 docs de feature

---

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
