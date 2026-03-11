# Previsao de Fluxo de Caixa

## Resumo
Projecao de saldo em 30/60/90 dias baseada em transacoes recorrentes, parcelas pendentes e saldo atual das contas.

## Fontes de Projecao

### 1. Transacoes Recorrentes
- Detecta padroes a partir de transacoes com `source: "recurring"` e `recurring_rule_id`
- Requer pelo menos 2 ocorrencias para detectar padrao
- Usa valor mais recente para projecao
- Calcula dia tipico do mes para cada padrao

### 2. Parcelas Pendentes
- Identifica grupos de parcelamento via `installment_group_id`
- Projeta parcelas restantes (`installment_number < installment_total`)
- Projeta a cada 30 dias a partir da ultima parcela

### 3. Saldo Atual
- Soma `balance_cents` de todas as contas ativas (`is_active: true`)
- Ponto de partida para a projecao

## Arquitetura

```
features/cashflow/
├── domain/
│   └── cashFlowRules.ts        # detectRecurringPatterns, projectRecurring, projectInstallments, buildProjection
├── application/
│   └── getCashFlowProjection.ts # Orquestra dados de AccountRepo + TransactionRepo
└── presentation/
    ├── CashFlowScreen.tsx       # Tela com cards de saldo + periodos
    └── CashFlowStyles.ts        # Styled components
```

## Tipos

```typescript
interface ProjectionPeriod {
  label: string;          // "30 dias" | "60 dias" | "90 dias"
  days: number;
  projected_balance_cents: number;
  income_cents: number;
  expense_cents: number;
  items: ProjectedItem[];
}

interface CashFlowResult {
  current_balance_cents: number;
  periods: ProjectionPeriod[];
}
```

## Navegacao
- Acessivel via icone "trending-up" no header do Dashboard
- Stack screen: `CashFlow`

## Testes
- 15 testes unitarios (cashFlowRules): padroes recorrentes, projecao mensal, parcelas, buildProjection
- 5 testes de aplicacao (getCashFlowProjection): integracao com repositorios
- Regressao: contas inativas nao contam no saldo, parcelas completas nao sao projetadas
