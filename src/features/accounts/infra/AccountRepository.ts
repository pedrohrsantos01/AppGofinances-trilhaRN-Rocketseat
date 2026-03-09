import { getDatabase } from "../../../shared/infra/database/database";
import { Account } from "../../../shared/domain/entities/Account";

export class AccountRepository {
  async create(account: Account): Promise<Account> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO accounts (id, name, type, balance_cents, currency, color, icon, is_active, created_at, updated_at, version, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        account.name,
        account.type,
        account.balance_cents,
        account.currency,
        account.color,
        account.icon,
        account.is_active ? 1 : 0,
        account.created_at,
        account.updated_at,
        account.version,
        account.user_id,
      ]
    );
    return account;
  }

  async update(account: Account): Promise<Account> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE accounts SET name = ?, type = ?, balance_cents = ?, color = ?, icon = ?, is_active = ?, updated_at = ?, version = ?
       WHERE id = ?`,
      [
        account.name,
        account.type,
        account.balance_cents,
        account.color,
        account.icon,
        account.is_active ? 1 : 0,
        account.updated_at,
        account.version,
        account.id,
      ]
    );
    return account;
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM accounts WHERE id = ?", [id]);
  }

  async getById(id: string): Promise<Account | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<AccountRow>("SELECT * FROM accounts WHERE id = ?", [id]);
    return row ? mapRowToAccount(row) : null;
  }

  async listByUser(userId: string): Promise<Account[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AccountRow>(
      "SELECT * FROM accounts WHERE user_id = ? AND is_active = 1 ORDER BY name",
      [userId]
    );
    return rows.map(mapRowToAccount);
  }
}

interface AccountRow {
  id: string;
  name: string;
  type: string;
  balance_cents: number;
  currency: string;
  color: string;
  icon: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

function mapRowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Account["type"],
    balance_cents: row.balance_cents,
    currency: "BRL",
    color: row.color,
    icon: row.icon,
    is_active: row.is_active === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
    version: row.version,
    user_id: row.user_id,
  };
}
