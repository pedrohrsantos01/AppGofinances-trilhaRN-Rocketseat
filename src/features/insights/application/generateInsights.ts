import { Insight } from "../../../shared/domain/entities/Insight";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { Money } from "../../../shared/domain/value-objects/Money";
import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import {
  detectRecurringExpenses,
  detectSpendingAnomalies,
  categorizeTrend,
} from "../domain/insightRules";

const txRepo = new TransactionRepository();

function groupByMonth(txs: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = tx.date.slice(0, 7); // YYYY-MM
    const list = map.get(key) ?? [];
    list.push(tx);
    map.set(key, list);
  }
  return map;
}

/**
 * Generates insights for a user based on their transaction history.
 * @param userId - User ID
 * @param month - 0-indexed month (0 = January)
 * @param year - Full year
 */
export async function generateInsights(
  userId: string,
  month: number,
  year: number
): Promise<Insight[]> {
  const allTxs = await txRepo.listByUser(userId);
  if (allTxs.length === 0) return [];

  const insights: Insight[] = [];
  const now = new Date().toISOString();

  const currentMonthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const byMonth = groupByMonth(allTxs);

  const currentMonthTxs = byMonth.get(currentMonthKey) ?? [];
  const previousMonthKeys = Array.from(byMonth.keys())
    .filter((k) => k < currentMonthKey)
    .sort();

  // 1. Recurring expenses
  const recurring = detectRecurringExpenses(allTxs);
  for (const pattern of recurring) {
    insights.push({
      id: `recurring-${pattern.name}-${pattern.category_id}`,
      type: "recurring_expense",
      title: `${pattern.name} recorrente`,
      description: `${pattern.name} aparece em ${pattern.occurrences} meses com valor medio de ${Money.fromCents(pattern.average_cents).toFormatted()}`,
      severity: "info",
      category_id: pattern.category_id,
      amount_cents: pattern.average_cents,
      reference_month: currentMonthKey,
      created_at: now,
      user_id: userId,
    });
  }

  // 2. Spending anomalies
  const previousMonthsData = previousMonthKeys.map((k) => byMonth.get(k) ?? []);
  const anomalies = detectSpendingAnomalies(currentMonthTxs, previousMonthsData);
  for (const anomaly of anomalies) {
    insights.push({
      id: `anomaly-${anomaly.category_id}-${currentMonthKey}`,
      type: "spending_anomaly",
      title: `Gasto acima da media em ${anomaly.category_id}`,
      description: `Gasto atual de ${Money.fromCents(anomaly.current_cents).toFormatted()} esta ${anomaly.percent_above}% acima da media de ${Money.fromCents(anomaly.average_cents).toFormatted()}`,
      severity: "warning",
      category_id: anomaly.category_id,
      amount_cents: anomaly.current_cents,
      reference_month: currentMonthKey,
      created_at: now,
      user_id: userId,
    });
  }

  // 3. Category trends (current vs previous month)
  if (previousMonthKeys.length > 0) {
    const prevMonthKey = previousMonthKeys[previousMonthKeys.length - 1];
    const prevMonthTxs = byMonth.get(prevMonthKey) ?? [];

    const currentByCategory = sumExpensesByCategory(currentMonthTxs);
    const prevByCategory = sumExpensesByCategory(prevMonthTxs);

    const allCategories = new Set([...currentByCategory.keys(), ...prevByCategory.keys()]);

    for (const cat of allCategories) {
      const current = currentByCategory.get(cat) ?? 0;
      const previous = prevByCategory.get(cat) ?? 0;
      const trend = categorizeTrend(current, previous);

      if (trend !== "stable") {
        const direction = trend === "up" ? "aumentou" : "diminuiu";
        const diff = Math.abs(current - previous);
        insights.push({
          id: `trend-${cat}-${currentMonthKey}`,
          type: "category_trend",
          title: `${cat} ${direction}`,
          description: `Gastos em ${cat} ${direction} ${Money.fromCents(diff).toFormatted()} em relacao ao mes anterior`,
          severity: "info",
          category_id: cat,
          amount_cents: current,
          reference_month: currentMonthKey,
          created_at: now,
          user_id: userId,
        });
      }
    }
  }

  return insights;
}

function sumExpensesByCategory(txs: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const tx of txs) {
    if (tx.type !== "expense") continue;
    map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + tx.amount_cents);
  }
  return map;
}
