import uuid from "react-native-uuid";
import { format } from "date-fns";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { TransactionRepository } from "../infra/TransactionRepository";
import { getDefaultAccountId } from "../../../shared/infra/database/seedDefaultAccount";

const transactionRepo = new TransactionRepository();

export interface CreateTransactionInput {
  name: string;
  amount: number;
  type: "positive" | "negative";
  categoryKey: string;
  userId: string;
}

const TYPE_MAP: Record<string, "income" | "expense"> = {
  positive: "income",
  negative: "expense",
};

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const { name, amount, type, categoryKey, userId } = input;

  const now = new Date();
  const amountCents = Math.round(amount * 100);

  const tx: Transaction = {
    id: String(uuid.v4()),
    name,
    amount_cents: amountCents,
    currency: "BRL",
    type: TYPE_MAP[type] ?? "expense",
    status: "confirmed",
    source: "manual",
    category_id: categoryKey,
    account_id: getDefaultAccountId(userId),
    date: format(now, "yyyy-MM-dd"),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    version: 1,
    user_id: userId,
  };

  return transactionRepo.create(tx);
}
