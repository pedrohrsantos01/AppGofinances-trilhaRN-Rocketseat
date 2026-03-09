export interface V1Transaction {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

export interface V2Transaction {
  id: string;
  name: string;
  amount_cents: number;
  amount: string;
  currency: "BRL";
  type: "income" | "expense";
  legacy_type: "positive" | "negative";
  status: "confirmed";
  source: "manual";
  category: string;
  category_id: string;
  account_id: string;
  date: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

const TYPE_MAP: Record<string, "income" | "expense"> = {
  positive: "income",
  negative: "expense",
};

export function amountStringToCents(amount: string): number {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) {
    return 0;
  }
  return Math.round(parsed * 100);
}

export function migrateTransactionV1ToV2(
  transaction: V1Transaction,
  userId: string,
  defaultAccountId: string
): V2Transaction {
  const now = new Date().toISOString();

  return {
    id: transaction.id,
    name: transaction.name,
    amount_cents: amountStringToCents(transaction.amount),
    amount: transaction.amount,
    currency: "BRL",
    type: TYPE_MAP[transaction.type] ?? "expense",
    legacy_type: transaction.type,
    status: "confirmed",
    source: "manual",
    category: transaction.category,
    category_id: transaction.category,
    account_id: defaultAccountId,
    date: transaction.date,
    created_at: transaction.date || now,
    updated_at: now,
    version: 1,
    user_id: userId,
  };
}

export function migrateAllTransactionsV1ToV2(
  transactions: V1Transaction[],
  userId: string,
  defaultAccountId: string
): V2Transaction[] {
  return transactions.map((t) => migrateTransactionV1ToV2(t, userId, defaultAccountId));
}
