import { Transaction } from "../../../shared/domain/entities/Transaction";

export interface AccountBalanceResult {
  balance_cents: number;
  income_cents: number;
  expense_cents: number;
  transaction_count: number;
}

export function calculateAccountBalance(
  transactions: Transaction[],
  accountId?: string
): AccountBalanceResult {
  let income_cents = 0;
  let expense_cents = 0;
  let transaction_count = 0;

  for (const t of transactions) {
    if (t.status === "cancelled") continue;
    if (accountId && t.account_id !== accountId) continue;

    transaction_count++;

    if (t.type === "income") {
      income_cents += t.amount_cents;
    } else {
      // expense and transfer both reduce account balance
      expense_cents += t.amount_cents;
    }
  }

  return {
    balance_cents: income_cents - expense_cents,
    income_cents,
    expense_cents,
    transaction_count,
  };
}
