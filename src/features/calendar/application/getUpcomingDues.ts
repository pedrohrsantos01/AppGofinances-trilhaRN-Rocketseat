import { format } from "date-fns";
import { ReminderRepository } from "../infra/ReminderRepository";
import { calculateUpcomingDues } from "../domain/upcomingDues";

const reminderRepo = new ReminderRepository();

export async function getUpcomingDues(userId: string, daysAhead: number = 7) {
  const reminders = await reminderRepo.listPending(userId);
  const today = format(new Date(), "yyyy-MM-dd");
  return calculateUpcomingDues(reminders, today, daysAhead);
}
