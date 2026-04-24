import { getDatabase } from "./database";

const DEFAULT_ACCOUNT_ID = "default-account";

export function getDefaultAccountId(userId: string): string {
  const normalizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${DEFAULT_ACCOUNT_ID}-${normalizedUserId}`;
}

export async function seedDefaultAccount(userId: string): Promise<void> {
  const db = await getDatabase();
  const defaultAccountId = getDefaultAccountId(userId);

  const existing = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM accounts WHERE id = ? AND user_id = ?",
    [defaultAccountId, userId]
  );

  if (existing) return;

  const legacy = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM accounts WHERE id = ? AND user_id = ?",
    [DEFAULT_ACCOUNT_ID, userId]
  );

  if (legacy) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(
        "UPDATE accounts SET id = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        [defaultAccountId, new Date().toISOString(), DEFAULT_ACCOUNT_ID, userId]
      );
      await txn.runAsync(
        "UPDATE transactions SET account_id = ? WHERE account_id = ? AND user_id = ?",
        [defaultAccountId, DEFAULT_ACCOUNT_ID, userId]
      );
      await txn.runAsync(
        "UPDATE credit_cards SET account_id = ? WHERE account_id = ? AND user_id = ?",
        [defaultAccountId, DEFAULT_ACCOUNT_ID, userId]
      );
    });
    return;
  }

  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO accounts (id, name, type, balance_cents, currency, color, icon, is_active, created_at, updated_at, version, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [defaultAccountId, "Carteira", "cash", 0, "BRL", "#5636D3", "wallet", 1, now, now, 1, userId]
  );
}

export { DEFAULT_ACCOUNT_ID };
