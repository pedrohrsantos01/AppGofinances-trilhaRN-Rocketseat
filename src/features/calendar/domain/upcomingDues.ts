import { differenceInDays, parseISO } from "date-fns";

export interface UpcomingDue {
  id: string;
  title: string;
  due_date: string;
  amount_cents: number;
  is_completed: boolean;
}

export function calculateUpcomingDues(
  reminders: UpcomingDue[],
  todayStr: string,
  daysAhead: number
): UpcomingDue[] {
  const today = parseISO(todayStr);

  return reminders
    .filter((r) => {
      if (r.is_completed) return false;
      const due = parseISO(r.due_date);
      const diff = differenceInDays(due, today);
      return diff >= 0 && diff <= daysAhead;
    })
    .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime());
}

export function shouldNotify(dueDate: string, today: string, daysBefore: number): boolean {
  const diff = differenceInDays(parseISO(dueDate), parseISO(today));
  return diff >= 0 && diff <= daysBefore;
}
