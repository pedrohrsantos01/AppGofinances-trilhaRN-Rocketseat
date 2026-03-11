import { Transaction } from "../../../shared/domain/entities/Transaction";

export interface RecurringPattern {
  name: string;
  amount_cents: number;
  type: "income" | "expense";
  frequency: "monthly";
  typical_day: number;
  category_id: string;
}

export interface ProjectedItem {
  date: string;
  amount_cents: number;
  type: "income" | "expense";
  name: string;
}

export interface ProjectionPeriod {
  label: string;
  days: number;
  projected_balance_cents: number;
  income_cents: number;
  expense_cents: number;
  items: ProjectedItem[];
}

/**
 * Detects recurring patterns from transactions that have recurring_rule_id.
 * Groups by recurring_rule_id and extracts frequency, typical day of month, and last amount.
 */
export function detectRecurringPatterns(transactions: Transaction[]): RecurringPattern[] {
  const recurring = transactions.filter((tx) => tx.source === "recurring" && tx.recurring_rule_id);

  const groups = new Map<string, Transaction[]>();
  for (const tx of recurring) {
    const key = tx.recurring_rule_id!;
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  const patterns: RecurringPattern[] = [];

  for (const [, txs] of groups) {
    if (txs.length < 2) continue;

    const sorted = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mostRecent = sorted[sorted.length - 1];
    const days = sorted.map((tx) => new Date(tx.date).getDate());
    const typicalDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length);

    patterns.push({
      name: mostRecent.name,
      amount_cents: mostRecent.amount_cents,
      type: mostRecent.type as "income" | "expense",
      frequency: "monthly",
      typical_day: typicalDay,
      category_id: mostRecent.category_id,
    });
  }

  return patterns;
}

/**
 * Projects future occurrences of recurring patterns within a window of days.
 */
export function projectRecurring(
  patterns: RecurringPattern[],
  baseDate: Date,
  daysAhead: number
): ProjectedItem[] {
  if (daysAhead <= 0) return [];

  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + daysAhead);

  const items: ProjectedItem[] = [];

  for (const pattern of patterns) {
    let current = new Date(baseDate);
    // Start from next month's typical day
    current.setMonth(current.getMonth() + 1);
    current.setDate(Math.min(pattern.typical_day, daysInMonth(current)));

    // If the resulting date is before or equal to baseDate, move to next month
    if (current <= baseDate) {
      current.setMonth(current.getMonth() + 1);
      current.setDate(Math.min(pattern.typical_day, daysInMonth(current)));
    }

    while (current < endDate) {
      items.push({
        date: current.toISOString().split("T")[0],
        amount_cents: pattern.amount_cents,
        type: pattern.type,
        name: pattern.name,
      });

      const nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(Math.min(pattern.typical_day, daysInMonth(nextMonth)));
      current = nextMonth;
    }
  }

  return items;
}

/**
 * Projects remaining installments from existing installment groups.
 * Finds the highest installment_number for each group and projects forward.
 */
export function projectInstallments(
  transactions: Transaction[],
  baseDate: Date,
  daysAhead: number
): ProjectedItem[] {
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + daysAhead);

  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (!tx.installment_group_id || !tx.installment_total) continue;
    const list = groups.get(tx.installment_group_id) ?? [];
    list.push(tx);
    groups.set(tx.installment_group_id, list);
  }

  const items: ProjectedItem[] = [];

  for (const [, txs] of groups) {
    const sorted = [...txs].sort(
      (a, b) => (a.installment_number ?? 0) - (b.installment_number ?? 0)
    );

    const last = sorted[sorted.length - 1];
    const total = last.installment_total!;
    const currentNum = last.installment_number ?? total;

    if (currentNum >= total) continue;

    const lastDate = new Date(last.date);
    const remaining = total - currentNum;

    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + i);

      if (nextDate > baseDate && nextDate < endDate) {
        items.push({
          date: nextDate.toISOString().split("T")[0],
          amount_cents: last.amount_cents,
          type: last.type as "income" | "expense",
          name: `${last.name} (${currentNum + i}/${total})`,
        });
      }
    }
  }

  return items;
}

/**
 * Builds a 30/60/90 day projection from current balance and projected items.
 */
export function buildProjection(
  currentBalanceCents: number,
  projectedItems: ProjectedItem[],
  baseDate: Date
): ProjectionPeriod[] {
  const periods = [
    { label: "30 dias", days: 30 },
    { label: "60 dias", days: 60 },
    { label: "90 dias", days: 90 },
  ];

  return periods.map(({ label, days }) => {
    const cutoff = new Date(baseDate);
    cutoff.setDate(cutoff.getDate() + days);

    const periodItems = projectedItems.filter(
      (item) => new Date(item.date) < cutoff && new Date(item.date) > baseDate
    );

    let incomeCents = 0;
    let expenseCents = 0;

    for (const item of periodItems) {
      if (item.type === "income") incomeCents += item.amount_cents;
      else expenseCents += item.amount_cents;
    }

    return {
      label,
      days,
      projected_balance_cents: currentBalanceCents + incomeCents - expenseCents,
      income_cents: incomeCents,
      expense_cents: expenseCents,
      items: periodItems,
    };
  });
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
