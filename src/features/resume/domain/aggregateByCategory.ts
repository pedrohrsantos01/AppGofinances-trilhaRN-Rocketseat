import { categories } from "../../../shared/utils/categories";

export interface RawTransaction {
  type: "positive" | "negative";
  name: string;
  amount: string;
  category: string;
  date: string;
}

export interface CategoryAggregate {
  key: string;
  name: string;
  totalFormatted: string;
  total: number;
  color: string;
  percent: string;
}

export function aggregateByCategory(
  transactions: RawTransaction[],
  month: number,
  year: number
): CategoryAggregate[] {
  const expenses = transactions.filter((t) => {
    const date = new Date(t.date);
    return t.type === "negative" && date.getMonth() === month && date.getFullYear() === year;
  });

  const expensesTotal = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

  if (expensesTotal === 0) {
    return [];
  }

  const result: CategoryAggregate[] = [];

  for (const category of categories) {
    let categorySum = 0;

    for (const expense of expenses) {
      if (expense.category === category.key) {
        categorySum += Number(expense.amount);
      }
    }

    if (categorySum > 0) {
      const totalFormatted = categorySum.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      const percent = `${((categorySum / expensesTotal) * 100).toFixed(0)}%`;

      result.push({
        key: category.key,
        name: category.name,
        color: category.color,
        total: categorySum,
        totalFormatted,
        percent,
      });
    }
  }

  return result;
}
