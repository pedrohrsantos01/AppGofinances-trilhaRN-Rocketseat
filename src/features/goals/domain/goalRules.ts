import { differenceInCalendarDays } from "date-fns";

export function goalProgress(currentCents: number, targetCents: number): number {
  if (targetCents <= 0) return 0;
  return Math.min(100, Math.round((currentCents / targetCents) * 100));
}

export function goalRemaining(currentCents: number, targetCents: number): number {
  return Math.max(0, targetCents - currentCents);
}

export function monthlyProjection(
  currentCents: number,
  targetCents: number,
  monthsLeft: number
): number {
  const remaining = goalRemaining(currentCents, targetCents);
  if (remaining <= 0) return 0;
  if (monthsLeft <= 1) return remaining;
  return Math.ceil(remaining / monthsLeft);
}

export function isGoalDelayed(
  currentCents: number,
  targetCents: number,
  targetDate?: string
): boolean {
  if (!targetDate) return false;
  if (currentCents >= targetCents) return false;
  return new Date(targetDate) < new Date();
}

export function daysUntilTarget(targetDate?: string): number | null {
  if (!targetDate) return null;
  const days = differenceInCalendarDays(new Date(targetDate), new Date());
  return Math.max(0, days);
}
