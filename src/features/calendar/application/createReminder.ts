import uuid from "react-native-uuid";
import { AppError } from "../../../shared/domain/errors/AppError";
import { ReminderRepository, Reminder } from "../infra/ReminderRepository";
import { scheduleReminderNotification } from "../infra/notificationService";

const reminderRepo = new ReminderRepository();

interface CreateReminderInput {
  title: string;
  due_date: string;
  amount_cents: number;
  recurrence?: string;
  notify_days_before?: number;
  user_id: string;
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  if (!input.title.trim()) {
    throw new AppError("VALIDATION_ERROR", "Título é obrigatório");
  }
  if (!input.due_date) {
    throw new AppError("VALIDATION_ERROR", "Data de vencimento é obrigatória");
  }

  const now = new Date().toISOString();
  const reminder: Reminder = {
    id: String(uuid.v4()),
    title: input.title.trim(),
    due_date: input.due_date,
    amount_cents: input.amount_cents,
    is_completed: false,
    recurrence: input.recurrence,
    notify_days_before: input.notify_days_before ?? 3,
    user_id: input.user_id,
    created_at: now,
    updated_at: now,
  };

  const created = await reminderRepo.create(reminder);

  try {
    await scheduleReminderNotification(
      created.id,
      created.title,
      created.due_date,
      created.notify_days_before ?? 3
    );
  } catch {
    // Notification scheduling is best-effort; don't fail the reminder creation
  }

  return created;
}
