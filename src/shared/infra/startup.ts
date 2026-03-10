import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "./database/database";
import { seedDefaultAccount } from "./database/seedDefaultAccount";
import { TransactionRepository } from "../../features/transactions/infra/TransactionRepository";
import { Transaction } from "../domain/entities/Transaction";
import { amountStringToCents } from "./storage/migrations/v1_to_v2";
import { format, parseISO } from "date-fns";

const MIGRATION_DONE_KEY = "@gofinances:sqlite_migrated";
const transactionRepo = new TransactionRepository();

const TYPE_MAP: Record<string, "income" | "expense"> = {
  positive: "income",
  negative: "expense",
};

interface LegacyTransaction {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

async function migrateAsyncStorageToSQLite(userId: string): Promise<void> {
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
  if (alreadyMigrated === "true") return;

  const dataKey = `@gofinances:transactions_user${userId}`;
  const raw = await AsyncStorage.getItem(dataKey);
  if (!raw) {
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
    return;
  }

  const legacyTxs: LegacyTransaction[] = JSON.parse(raw);
  if (legacyTxs.length === 0) {
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
    return;
  }

  const transactions: Transaction[] = legacyTxs.map((tx) => {
    const dateStr = tx.date || new Date().toISOString();
    let formattedDate: string;
    try {
      formattedDate = format(parseISO(dateStr), "yyyy-MM-dd");
    } catch {
      formattedDate = format(new Date(dateStr), "yyyy-MM-dd");
    }

    return {
      id: tx.id,
      name: tx.name,
      amount_cents: amountStringToCents(tx.amount),
      currency: "BRL" as const,
      type: TYPE_MAP[tx.type] ?? "expense",
      status: "confirmed" as const,
      source: "manual" as const,
      category_id: tx.category,
      account_id: "default-account",
      date: formattedDate,
      created_at: dateStr,
      updated_at: dateStr,
      version: 1,
      user_id: userId,
    };
  });

  await transactionRepo.createMany(transactions);
  await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
}

export async function initializeApp(userId: string): Promise<void> {
  await getDatabase();
  await seedDefaultAccount(userId);
  await migrateAsyncStorageToSQLite(userId);
}
