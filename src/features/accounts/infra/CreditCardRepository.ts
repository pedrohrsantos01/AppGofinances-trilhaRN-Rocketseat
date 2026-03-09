import { getDatabase } from "../../../shared/infra/database/database";
import { CreditCard } from "../../../shared/domain/entities/CreditCard";

export class CreditCardRepository {
  async create(card: CreditCard): Promise<CreditCard> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO credit_cards (id, name, limit_cents, closing_day, due_day, currency, color, is_active, account_id, created_at, updated_at, version, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        card.id,
        card.name,
        card.limit_cents,
        card.closing_day,
        card.due_day,
        card.currency,
        card.color,
        card.is_active ? 1 : 0,
        card.account_id,
        card.created_at,
        card.updated_at,
        card.version,
        card.user_id,
      ]
    );
    return card;
  }

  async update(card: CreditCard): Promise<CreditCard> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE credit_cards SET name = ?, limit_cents = ?, closing_day = ?, due_day = ?, color = ?, is_active = ?, updated_at = ?, version = ?
       WHERE id = ?`,
      [
        card.name,
        card.limit_cents,
        card.closing_day,
        card.due_day,
        card.color,
        card.is_active ? 1 : 0,
        card.updated_at,
        card.version,
        card.id,
      ]
    );
    return card;
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM credit_cards WHERE id = ?", [id]);
  }

  async getById(id: string): Promise<CreditCard | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<CreditCardRow>("SELECT * FROM credit_cards WHERE id = ?", [
      id,
    ]);
    return row ? mapRowToCreditCard(row) : null;
  }

  async listByUser(userId: string): Promise<CreditCard[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<CreditCardRow>(
      "SELECT * FROM credit_cards WHERE user_id = ? AND is_active = 1 ORDER BY name",
      [userId]
    );
    return rows.map(mapRowToCreditCard);
  }
}

interface CreditCardRow {
  id: string;
  name: string;
  limit_cents: number;
  closing_day: number;
  due_day: number;
  currency: string;
  color: string;
  is_active: number;
  account_id: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

function mapRowToCreditCard(row: CreditCardRow): CreditCard {
  return {
    id: row.id,
    name: row.name,
    limit_cents: row.limit_cents,
    closing_day: row.closing_day,
    due_day: row.due_day,
    currency: "BRL",
    color: row.color,
    is_active: row.is_active === 1,
    account_id: row.account_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    version: row.version,
    user_id: row.user_id,
  };
}
