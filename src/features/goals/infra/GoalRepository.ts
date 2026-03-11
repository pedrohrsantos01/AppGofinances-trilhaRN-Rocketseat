import { getDatabase } from "../../../shared/infra/database/database";
import { Goal, GoalStatus } from "../../../shared/domain/entities/Goal";
import { enqueueChange } from "../../sync/application/syncService";

function toPayload(goal: Goal): Record<string, unknown> {
  return { ...goal };
}

interface GoalRow {
  id: string;
  name: string;
  target_cents: number;
  current_cents: number;
  currency: string;
  status: string;
  target_date: string | null;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}

function mapRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    target_cents: row.target_cents,
    current_cents: row.current_cents,
    currency: "BRL",
    status: row.status as GoalStatus,
    target_date: row.target_date ?? undefined,
    color: row.color,
    icon: row.icon,
    created_at: row.created_at,
    updated_at: row.updated_at,
    version: row.version,
    user_id: row.user_id,
  };
}

export class GoalRepository {
  async create(goal: Goal): Promise<Goal> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO goals (id, name, target_cents, current_cents, currency, status, target_date, color, icon, created_at, updated_at, version, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.name,
        goal.target_cents,
        goal.current_cents,
        goal.currency,
        goal.status,
        goal.target_date ?? null,
        goal.color,
        goal.icon,
        goal.created_at,
        goal.updated_at,
        goal.version,
        goal.user_id,
      ]
    );
    enqueueChange("goals", goal.id, "insert", toPayload(goal)).catch(() => {});
    return goal;
  }

  async update(goal: Goal): Promise<Goal> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE goals SET name = ?, target_cents = ?, current_cents = ?, status = ?, target_date = ?, color = ?, icon = ?, updated_at = ?, version = version + 1
       WHERE id = ?`,
      [
        goal.name,
        goal.target_cents,
        goal.current_cents,
        goal.status,
        goal.target_date ?? null,
        goal.color,
        goal.icon,
        now,
        goal.id,
      ]
    );
    const updated = { ...goal, updated_at: now, version: goal.version + 1 };
    enqueueChange("goals", goal.id, "update", toPayload(updated)).catch(() => {});
    return updated;
  }

  async contribute(id: string, amountCents: number): Promise<Goal | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE goals SET current_cents = current_cents + ?, updated_at = ?, version = version + 1 WHERE id = ?`,
      [amountCents, now, id]
    );
    const goal = await this.getById(id);
    if (goal) {
      enqueueChange("goals", id, "update", toPayload(goal)).catch(() => {});
    }
    return goal;
  }

  async getById(id: string): Promise<Goal | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<GoalRow>("SELECT * FROM goals WHERE id = ?", [id]);
    return row ? mapRow(row) : null;
  }

  async listByUser(userId: string, status?: GoalStatus): Promise<Goal[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM goals WHERE user_id = ?";
    const params: (string | number)[] = [userId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const rows = await db.getAllAsync<GoalRow>(query, params);
    return rows.map(mapRow);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM goals WHERE id = ?", [id]);
    enqueueChange("goals", id, "delete", null).catch(() => {});
  }
}
