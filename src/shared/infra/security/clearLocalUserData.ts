import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "../database/database";

const USER_SCOPED_TABLES = [
  "transactions",
  "invoices",
  "credit_cards",
  "accounts",
  "budgets",
  "reminders",
  "goals",
];

export async function clearLocalUserData(userId: string): Promise<void> {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const table of USER_SCOPED_TABLES) {
      await txn.runAsync(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
    }
    await txn.runAsync("DELETE FROM sync_queue");
  });

  await AsyncStorage.removeItem("@gofinances:last_sync_at");
}
