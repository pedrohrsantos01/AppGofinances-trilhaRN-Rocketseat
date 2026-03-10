export interface BudgetConsumption {
  spent_cents: number;
  remaining_cents: number;
  percent: number;
}

export function calculateBudgetConsumption(
  limit_cents: number,
  spent_cents: number
): BudgetConsumption {
  if (limit_cents === 0) {
    return { spent_cents, remaining_cents: 0, percent: 0 };
  }

  return {
    spent_cents,
    remaining_cents: limit_cents - spent_cents,
    percent: Math.round((spent_cents / limit_cents) * 100),
  };
}

export type BudgetAlertLevel = "warning" | "critical";

export function checkBudgetAlert(
  limit_cents: number,
  spent_cents: number
): BudgetAlertLevel | null {
  if (limit_cents === 0) return null;

  const percent = (spent_cents / limit_cents) * 100;

  if (percent >= 100) return "critical";
  if (percent >= 80) return "warning";
  return null;
}

interface RolloverInput {
  current_limit_cents: number;
  previous_limit_cents: number;
  previous_spent_cents: number;
}

export function applyRollover(input: RolloverInput): number {
  const previousRemaining = input.previous_limit_cents - input.previous_spent_cents;
  const adjusted = input.current_limit_cents + previousRemaining;
  return Math.max(0, adjusted);
}
