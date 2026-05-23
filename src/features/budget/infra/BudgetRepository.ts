import { getDatabase } from "../../../shared/infra/database/database";
import { Budget } from "../../../shared/domain/entities/Budget";
import { safeEnqueueChange } from "../../sync/application/syncService";

function toPayload(budget: Budget): Record<string, unknown> {
  return { ...budget, rollover: budget.rollover ? 1 : 0 };
}

export class BudgetRepository {
  async upsert(budget: Budget): Promise<Budget> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO budgets (id, category_id, limit_cents, spent_cents, month, year, rollover, currency, created_at, updated_at, version, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, category_id, month, year)
       DO UPDATE SET limit_cents = ?, rollover = ?, updated_at = ?, version = version + 1`,
      [
        budget.id,
        budget.category_id,
        budget.limit_cents,
        budget.spent_cents,
        budget.month,
        budget.year,
        budget.rollover ? 1 : 0,
        budget.currency,
        budget.created_at,
        budget.updated_at,
        budget.version,
        budget.user_id,
        budget.limit_cents,
        budget.rollover ? 1 : 0,
        budget.updated_at,
      ]
    );
    await safeEnqueueChange("budgets", budget.id, "insert", toPayload(budget));
    return budget;
  }

  async updateSpent(id: string, spent_cents: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE budgets SET spent_cents = ?, updated_at = ? WHERE id = ?", [
      spent_cents,
      new Date().toISOString(),
      id,
    ]);
  }

  async listByUser(userId: string, month: number, year: number): Promise<Budget[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BudgetRow>(
      "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ? ORDER BY category_id",
      [userId, month, year]
    );
    return rows.map(mapRow);
  }

  async getByCategory(
    userId: string,
    categoryId: string,
    month: number,
    year: number
  ): Promise<Budget | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BudgetRow>(
      "SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?",
      [userId, categoryId, month, year]
    );
    return row ? mapRow(row) : null;
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM budgets WHERE id = ?", [id]);
    await safeEnqueueChange("budgets", id, "delete", null);
  }
}

interface BudgetRow {
  id: string;
  category_id: string;
  limit_cents: number;
  spent_cents: number;
  month: number;
  year: number;
  rollover: number;
  currency: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

function mapRow(row: BudgetRow): Budget {
  return {
    id: row.id,
    category_id: row.category_id,
    limit_cents: row.limit_cents,
    spent_cents: row.spent_cents,
    month: row.month,
    year: row.year,
    rollover: row.rollover === 1,
    currency: "BRL",
    created_at: row.created_at,
    updated_at: row.updated_at,
    version: row.version,
    user_id: row.user_id,
  };
}
