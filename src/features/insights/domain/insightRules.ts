import { Transaction } from "../../../shared/domain/entities/Transaction";

export interface RecurringPattern {
  name: string;
  category_id: string;
  average_cents: number;
  occurrences: number;
  months: string[];
}

export interface SpendingAnomaly {
  category_id: string;
  current_cents: number;
  average_cents: number;
  percent_above: number;
}

export type Trend = "up" | "down" | "stable";

/**
 * Detects expenses that recur monthly (3+ distinct months) with similar amounts (within 10%).
 * Groups by name + category_id.
 */
export function detectRecurringExpenses(transactions: Transaction[]): RecurringPattern[] {
  const expenses = transactions.filter((tx) => tx.type === "expense");

  const groups = new Map<string, Transaction[]>();
  for (const tx of expenses) {
    const key = `${tx.name}::${tx.category_id}`;
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  const patterns: RecurringPattern[] = [];

  for (const [, txs] of groups) {
    const monthSet = new Set(txs.map((tx) => tx.date.slice(0, 7)));
    if (monthSet.size < 3) continue;

    const amounts = txs.map((tx) => tx.amount_cents);
    const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);

    const withinTolerance = amounts.every((a) => Math.abs(a - avg) / avg <= 0.1);
    if (!withinTolerance) continue;

    patterns.push({
      name: txs[0].name,
      category_id: txs[0].category_id,
      average_cents: avg,
      occurrences: monthSet.size,
      months: Array.from(monthSet).sort(),
    });
  }

  return patterns;
}

/**
 * Detects categories where current month spending exceeds the historical average by >50%.
 * Only considers expense transactions.
 */
export function detectSpendingAnomalies(
  currentMonth: Transaction[],
  previousMonths: Transaction[][]
): SpendingAnomaly[] {
  if (previousMonths.length === 0) return [];

  const currentExpenses = currentMonth.filter((tx) => tx.type === "expense");
  const currentByCategory = sumByCategory(currentExpenses);

  const historicalByCategoryByMonth: Map<string, number[]> = new Map();
  for (const month of previousMonths) {
    const expenses = month.filter((tx) => tx.type === "expense");
    const sums = sumByCategory(expenses);
    for (const [cat, total] of sums) {
      const list = historicalByCategoryByMonth.get(cat) ?? [];
      list.push(total);
      historicalByCategoryByMonth.set(cat, list);
    }
  }

  const anomalies: SpendingAnomaly[] = [];

  for (const [category_id, currentTotal] of currentByCategory) {
    const historicalAmounts = historicalByCategoryByMonth.get(category_id);
    if (!historicalAmounts || historicalAmounts.length === 0) continue;

    const avg = Math.round(historicalAmounts.reduce((a, b) => a + b, 0) / historicalAmounts.length);
    if (avg === 0) continue;

    const percentAbove = ((currentTotal - avg) / avg) * 100;
    if (percentAbove > 50) {
      anomalies.push({
        category_id,
        current_cents: currentTotal,
        average_cents: avg,
        percent_above: Math.round(percentAbove),
      });
    }
  }

  return anomalies;
}

/**
 * Categorizes spending trend: up (>5% increase), down (>5% decrease), or stable.
 */
export function categorizeTrend(current: number, previous: number): Trend {
  if (previous === 0) return current > 0 ? "up" : "stable";
  const change = (current - previous) / previous;
  if (change > 0.05) return "up";
  if (change < -0.05) return "down";
  return "stable";
}

function sumByCategory(txs: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const tx of txs) {
    map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + tx.amount_cents);
  }
  return map;
}
