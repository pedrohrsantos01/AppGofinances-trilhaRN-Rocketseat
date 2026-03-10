import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import { categories } from "../../../shared/utils/categories";
import { Money } from "../../../shared/domain/value-objects/Money";

const transactionRepo = new TransactionRepository();

export interface CategoryBreakdown {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export async function getCategoryBreakdown(
  userId: string,
  month: number,
  year: number
): Promise<CategoryBreakdown[]> {
  const txs = await transactionRepo.listByUser(userId, { month, year });

  const expenses = txs.filter((tx) => tx.type === "expense");
  const totalCents = expenses.reduce((acc, tx) => acc + tx.amount_cents, 0);

  if (totalCents === 0) return [];

  const result: CategoryBreakdown[] = [];

  categories.forEach((cat) => {
    let sumCents = 0;
    expenses.forEach((tx) => {
      if (tx.category_id === cat.key) {
        sumCents += tx.amount_cents;
      }
    });

    if (sumCents > 0) {
      result.push({
        key: cat.key,
        name: cat.name,
        total: sumCents,
        totalFormatted: Money.fromCents(sumCents).toFormatted(),
        color: cat.color,
        percent: `${((sumCents / totalCents) * 100).toFixed(0)}%`,
      });
    }
  });

  return result;
}
