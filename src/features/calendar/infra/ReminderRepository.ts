import { getDatabase } from "../../../shared/infra/database/database";

export interface Reminder {
  id: string;
  title: string;
  due_date: string;
  amount_cents: number;
  is_completed: boolean;
  recurrence?: string;
  notify_days_before: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ReminderRow {
  id: string;
  title: string;
  due_date: string;
  amount_cents: number;
  is_completed: number;
  recurrence: string | null;
  notify_days_before: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    title: row.title,
    due_date: row.due_date,
    amount_cents: row.amount_cents,
    is_completed: row.is_completed === 1,
    recurrence: row.recurrence ?? undefined,
    notify_days_before: row.notify_days_before,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class ReminderRepository {
  async create(reminder: Reminder): Promise<Reminder> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO reminders (id, title, due_date, amount_cents, is_completed, recurrence, notify_days_before, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reminder.id,
        reminder.title,
        reminder.due_date,
        reminder.amount_cents,
        reminder.is_completed ? 1 : 0,
        reminder.recurrence ?? null,
        reminder.notify_days_before,
        reminder.user_id,
        reminder.created_at,
        reminder.updated_at,
      ]
    );
    return reminder;
  }

  async update(reminder: Reminder): Promise<Reminder> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE reminders SET title = ?, due_date = ?, amount_cents = ?, is_completed = ?, recurrence = ?, notify_days_before = ?, updated_at = ?
       WHERE id = ?`,
      [
        reminder.title,
        reminder.due_date,
        reminder.amount_cents,
        reminder.is_completed ? 1 : 0,
        reminder.recurrence ?? null,
        reminder.notify_days_before,
        reminder.updated_at,
        reminder.id,
      ]
    );
    return reminder;
  }

  async markCompleted(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE reminders SET is_completed = 1, updated_at = ? WHERE id = ?", [
      new Date().toISOString(),
      id,
    ]);
  }

  async listByUser(userId: string): Promise<Reminder[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReminderRow>(
      "SELECT * FROM reminders WHERE user_id = ? ORDER BY due_date ASC",
      [userId]
    );
    return rows.map(mapRow);
  }

  async listPending(userId: string): Promise<Reminder[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReminderRow>(
      "SELECT * FROM reminders WHERE user_id = ? AND is_completed = 0 ORDER BY due_date ASC",
      [userId]
    );
    return rows.map(mapRow);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM reminders WHERE id = ?", [id]);
  }
}
