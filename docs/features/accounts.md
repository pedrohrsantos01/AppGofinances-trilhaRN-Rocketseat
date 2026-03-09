# Contas e Cartões

## Visão Geral
Permite ao usuário gerenciar múltiplas contas financeiras (carteira, conta corrente, poupança, investimento) e cartões de crédito com controle de fatura.

## Entidades
- `Account` — conta financeira com saldo calculado
- `CreditCard` — cartão de crédito vinculado a uma conta
- `Invoice` — fatura mensal de cartão de crédito

## Regras de Domínio
- `calculateAccountBalance` — calcula saldo a partir das transações (ignora canceladas, transfers debitam)
- `calculateInvoiceTotal` — soma transações de uma fatura
- `getInvoiceStatus` — determina status da fatura (open/closed/paid/partially_paid/overdue)
- `generateInvoiceDates` — gera datas de fechamento e vencimento

## Storage
- SQLite via `expo-sqlite` (tabelas: accounts, credit_cards, invoices)
- Conta default "Carteira" criada automaticamente no primeiro acesso

## Telas
- `AccountList` — lista de contas com saldo formatado
- `AccountForm` — formulário de criação de conta (nome + tipo)

## Testes
- 8 unit: calculateAccountBalance
- 14 unit: invoiceRules (total, status, dates)
- 5 regression: reconciliação de saldo após edit/delete/cancel
