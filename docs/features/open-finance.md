# Open Finance Brasil

## Resumo
Integracao com Open Finance Brasil para importar transacoes e saldos de instituicoes financeiras autorizadas pelo usuario.

## Status
Camada de dominio e contratos implementados. Integracao real requer credenciais de API e certificacao junto ao Banco Central.

## Arquitetura

```
features/open-finance/
├── domain/
│   └── openFinanceRules.ts        # mapProviderTransaction, isConsentValid, needsConsentRenewal, deduplicateImported
├── application/
│   └── syncOpenFinance.ts         # Orquestra fetch + map + deduplicate + persist
└── infra/
    └── OpenFinanceProvider.ts     # Interface do provider + StubOpenFinanceProvider
```

## Entidade

```typescript
interface OpenFinanceConnection {
  id: string;
  institution_id: string;
  institution_name: string;
  consent_id: string;
  status: "pending" | "active" | "expired" | "revoked" | "error";
  scopes: string[];
  consent_expires_at: string;
  last_sync_at?: string;
  // ...metadata
}
```

## Regras de Dominio
- **mapProviderTransaction**: CREDIT → income, DEBIT → expense, amount decimal → cents
- **isConsentValid**: status must be "active" AND not expired
- **needsConsentRenewal**: warns when consent expires within 7 days
- **deduplicateImported**: match by name + amount_cents + date to avoid duplicates

## Provider Contract
Interface `OpenFinanceProvider` com metodos:
- `requestConsent()` - inicia fluxo de autorizacao
- `getConsentStatus()` - verifica status do consentimento
- `revokeConsent()` - revoga autorizacao
- `fetchTransactions()` - busca transacoes do periodo
- `fetchBalance()` - busca saldo da conta

`StubOpenFinanceProvider` fornecido para desenvolvimento e testes.

## Testes
- 15 testes unitarios: mapeamento de transacoes, validacao de consentimento, deduplicacao
- Regressao: renovacao de consentimento sem perda de dados
