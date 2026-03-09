import { getDatabase } from "./database";

const DEFAULT_ACCOUNT_ID = "default-account";

export async function seedDefaultAccount(userId: string): Promise<void> {
  const db = await getDatabase();

  const existing = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM accounts WHERE id = ? AND user_id = ?",
    [DEFAULT_ACCOUNT_ID, userId]
  );

  if (existing) return;

  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO accounts (id, name, type, balance_cents, currency, color, icon, is_active, created_at, updated_at, version, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [DEFAULT_ACCOUNT_ID, "Carteira", "cash", 0, "BRL", "#5636D3", "wallet", 1, now, now, 1, userId]
  );
}

export { DEFAULT_ACCOUNT_ID };
