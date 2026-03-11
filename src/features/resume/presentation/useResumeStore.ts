import { create } from "zustand";
import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import { Money } from "../../../shared/domain/value-objects/Money";
import { categories } from "../../../shared/utils/categories";

export interface CategoryData {
  key: string;
  name: string;
  totalFormatted: string;
  total: number;
  color: string;
  percent: string;
}

interface ResumeState {
  totalByCategories: CategoryData[];
  isLoading: boolean;

  loadData: (userId: string, month: number, year: number) => Promise<void>;
}

const transactionRepo = new TransactionRepository();

export const useResumeStore = create<ResumeState>((set) => ({
  totalByCategories: [],
  isLoading: false,

  loadData: async (userId: string, month: number, year: number) => {
    set({ isLoading: true });

    const txs = await transactionRepo.listByUser(userId, { month, year });
    const expenses = txs.filter((tx) => tx.type === "expense");
    const expensesTotalCents = expenses.reduce((acc, tx) => acc + tx.amount_cents, 0);

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySumCents = 0;

      expenses.forEach((tx) => {
        if (tx.category_id === category.key) {
          categorySumCents += tx.amount_cents;
        }
      });

      if (categorySumCents > 0) {
        totalByCategory.push({
          name: category.name,
          color: category.color,
          key: category.key,
          total: categorySumCents,
          totalFormatted: Money.fromCents(categorySumCents).toFormatted(),
          percent: `${((categorySumCents / expensesTotalCents) * 100).toFixed(0)}%`,
        });
      }
    });

    set({ totalByCategories: totalByCategory, isLoading: false });
  },
}));
