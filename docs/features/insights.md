# Insights Automaticos

## Resumo
Analise automatica de transacoes para detectar padroes recorrentes, anomalias de gasto e tendencias por categoria.

## Tipos de Insight

### 1. Despesas Recorrentes (`recurring_expense`)
- Detecta gastos que aparecem em 3+ meses diferentes com mesmo nome e categoria
- Tolerancia de 10% na variacao de valor
- Severidade: `info`

### 2. Anomalias de Gasto (`spending_anomaly`)
- Compara gasto do mes atual por categoria com a media historica
- Flageia categorias com gasto >50% acima da media
- Severidade: `warning`

### 3. Tendencia por Categoria (`category_trend`)
- Compara gasto do mes atual vs mes anterior por categoria
- Classifica como `up` (>5%), `down` (<-5%) ou `stable`
- Severidade: `info`

## Arquitetura

```
features/insights/
├── domain/
│   └── insightRules.ts      # Funcoes puras: detectRecurring, detectAnomalies, categorizeTrend
├── application/
│   └── generateInsights.ts  # Orquestra geracao de insights a partir de TransactionRepository
└── presentation/
    ├── InsightList.tsx       # Tela com lista de insights
    └── InsightListStyles.ts  # Styled components
```

## Entidade

```typescript
interface Insight {
  id: string;
  type: "recurring_expense" | "spending_anomaly" | "category_trend";
  title: string;
  description: string;
  severity: "info" | "warning" | "alert";
  category_id?: string;
  amount_cents?: number;
  reference_month: string; // YYYY-MM
  created_at: string;
  user_id: string;
}
```

## Navegacao
- Acessivel via icone "zap" no header do Dashboard
- Stack screen: `InsightList`

## Testes
- 17 testes unitarios (insightRules): recorrencia, anomalias, tendencias
- 5 testes de aplicacao (generateInsights): integracao com repositorio
- Regressao: falso positivo em variacao sazonal
