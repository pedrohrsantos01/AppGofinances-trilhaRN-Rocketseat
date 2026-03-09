import { getDatabase } from "../../../shared/infra/database/database";
import { Transaction } from "../../../shared/domain/entities/Transaction";

export class TransactionRepository {
  async create(tx: Transaction): Promise<Transaction> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO transactions (id, amount_cents, currency, type, status, source, name, category_id, account_id, credit_card_id, recurring_rule_id, installment_group_id, installment_number, installment_total, date, created_at, updated_at, version, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.amount_cents,
        tx.currency,
        tx.type,
        tx.status,
        tx.source,
        tx.name,
        tx.category_id,
        tx.account_id,
        tx.credit_card_id ?? null,
        tx.recurring_rule_id ?? null,
        tx.installment_group_id ?? null,
        tx.installment_number ?? null,
        tx.installment_total ?? null,
        tx.date,
        tx.created_at,
        tx.updated_at,
        tx.version,
        tx.user_id,
      ]
    );
    return tx;
  }

  async createMany(transactions: Transaction[]): Promise<void> {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
      for (const tx of transactions) {
        await txn.runAsync(
          `INSERT INTO transactions (id, amount_cents, currency, type, status, source, name, category_id, account_id, credit_card_id, recurring_rule_id, installment_group_id, installment_number, installment_total, date, created_at, updated_at, version, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tx.id,
            tx.amount_cents,
            tx.currency,
            tx.type,
            tx.status,
            tx.source,
            tx.name,
            tx.category_id,
            tx.account_id,
            tx.credit_card_id ?? null,
            tx.recurring_rule_id ?? null,
            tx.installment_group_id ?? null,
            tx.installment_number ?? null,
            tx.installment_total ?? null,
            tx.date,
            tx.created_at,
            tx.updated_at,
            tx.version,
            tx.user_id,
          ]
        );
      }
    });
  }

  async update(tx: Transaction): Promise<Transaction> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE transactions SET amount_cents = ?, type = ?, status = ?, name = ?, category_id = ?, account_id = ?, date = ?, updated_at = ?, version = version + 1
       WHERE id = ?`,
      [
        tx.amount_cents,
        tx.type,
        tx.status,
        tx.name,
        tx.category_id,
        tx.account_id,
        tx.date,
        now,
        tx.id,
      ]
    );
    return { ...tx, updated_at: now, version: tx.version + 1 };
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
  }

  async getById(id: string): Promise<Transaction | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TransactionRow>("SELECT * FROM transactions WHERE id = ?", [
      id,
    ]);
    return row ? mapRow(row) : null;
  }

  async listByUser(
    userId: string,
    options?: { month?: number; year?: number; accountId?: string }
  ): Promise<Transaction[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM transactions WHERE user_id = ?";
    const params: (string | number)[] = [userId];

    if (options?.accountId) {
      query += " AND account_id = ?";
      params.push(options.accountId);
    }

    if (options?.month !== undefined && options?.year !== undefined) {
      query +=
        " AND CAST(strftime('%m', date) AS INTEGER) = ? AND CAST(strftime('%Y', date) AS INTEGER) = ?";
      params.push(options.month + 1, options.year);
    }

    query += " ORDER BY date DESC";

    const rows = await db.getAllAsync<TransactionRow>(query, params);
    return rows.map(mapRow);
  }

  async deleteByInstallmentGroup(groupId: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync("DELETE FROM transactions WHERE installment_group_id = ?", [
      groupId,
    ]);
    return result.changes;
  }

  async deleteByRecurringRule(ruleId: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync("DELETE FROM transactions WHERE recurring_rule_id = ?", [
      ruleId,
    ]);
    return result.changes;
  }
}

interface TransactionRow {
  id: string;
  amount_cents: number;
  currency: string;
  type: string;
  status: string;
  source: string;
  name: string;
  category_id: string;
  account_id: string;
  credit_card_id: string | null;
  recurring_rule_id: string | null;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  date: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount_cents: row.amount_cents,
    currency: "BRL",
    type: row.type as Transaction["type"],
    status: row.status as Transaction["status"],
    source: row.source as Transaction["source"],
    name: row.name,
    category_id: row.category_id,
    account_id: row.account_id,
    credit_card_id: row.credit_card_id ?? undefined,
    recurring_rule_id: row.recurring_rule_id ?? undefined,
    installment_group_id: row.installment_group_id ?? undefined,
    installment_number: row.installment_number ?? undefined,
    installment_total: row.installment_total ?? undefined,
    date: row.date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    version: row.version,
    user_id: row.user_id,
  };
}
