import { create } from "zustand";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { Money } from "../../../shared/domain/value-objects/Money";
import { TransactionRepository } from "../infra/TransactionRepository";

interface HighLightProps {
  amount: string;
  lastTransaction: string;
}

interface HighLightData {
  entries: HighLightProps;
  expensives: HighLightProps;
  total: HighLightProps;
}

export interface FormattedTransaction {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

interface TransactionState {
  rawTransactions: Transaction[];
  formattedTransactions: FormattedTransaction[];
  highlightData: HighLightData;
  isLoading: boolean;

  loadTransactions: (userId: string) => Promise<void>;
  deleteTransaction: (id: string, userId: string) => Promise<void>;
  getById: (id: string) => Transaction | undefined;
}

const transactionRepo = new TransactionRepository();

function formatCurrency(cents: number): string {
  return Money.fromCents(cents).toFormatted();
}

function getLastTransactionDate(txs: Transaction[], type: "income" | "expense"): string | 0 {
  const filtered = txs.filter((tx) => tx.type === type);
  if (filtered.length === 0) return 0;

  const lastDate = new Date(Math.max(...filtered.map((tx) => new Date(tx.date).getTime())));
  return `${lastDate.getDate()} de ${lastDate.toLocaleString("pt-BR", {
    month: "long",
  })}`;
}

function computeState(txs: Transaction[]) {
  let entriesTotal = 0;
  let expensiveTotal = 0;

  const formattedTransactions: FormattedTransaction[] = txs.map((tx) => {
    if (tx.type === "income") entriesTotal += tx.amount_cents;
    else if (tx.type === "expense") expensiveTotal += tx.amount_cents;

    return {
      id: tx.id,
      name: tx.name,
      amount: Money.fromCents(tx.amount_cents).toFormatted(),
      type: tx.type === "income" ? ("positive" as const) : ("negative" as const),
      category: tx.category_id,
      date: Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(new Date(tx.date)),
    };
  });

  const lastEntries = getLastTransactionDate(txs, "income");
  const lastExpensives = getLastTransactionDate(txs, "expense");
  const totalInterval = lastExpensives === 0 ? "Não há transações" : `01 à ${lastExpensives}`;
  const total = entriesTotal - expensiveTotal;

  const highlightData: HighLightData = {
    entries: {
      amount: formatCurrency(entriesTotal),
      lastTransaction: lastEntries === 0 ? "Não há transações" : `Última entrada ${lastEntries}`,
    },
    expensives: {
      amount: formatCurrency(expensiveTotal),
      lastTransaction:
        lastExpensives === 0 ? "Não há transações" : `Última saída ${lastExpensives}`,
    },
    total: {
      amount: formatCurrency(total),
      lastTransaction: totalInterval,
    },
  };

  return { formattedTransactions, highlightData };
}

const emptyHighlight: HighLightData = {
  entries: { amount: "R$ 0,00", lastTransaction: "Não há transações" },
  expensives: { amount: "R$ 0,00", lastTransaction: "Não há transações" },
  total: { amount: "R$ 0,00", lastTransaction: "Não há transações" },
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  rawTransactions: [],
  formattedTransactions: [],
  highlightData: emptyHighlight,
  isLoading: true,

  loadTransactions: async (userId: string) => {
    set({ isLoading: true });
    const txs = await transactionRepo.listByUser(userId);
    const { formattedTransactions, highlightData } = computeState(txs);
    set({ rawTransactions: txs, formattedTransactions, highlightData, isLoading: false });
  },

  deleteTransaction: async (id: string, userId: string) => {
    await transactionRepo.delete(id);
    await get().loadTransactions(userId);
  },

  getById: (id: string) => {
    return get().rawTransactions.find((tx) => tx.id === id);
  },
}));
