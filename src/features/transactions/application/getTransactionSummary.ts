import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculateSummary,
  formatLastTransactionDate,
  RawTransaction,
} from "../domain/calculateSummary";

export interface FormattedTransaction {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

export interface HighlightData {
  entries: { amount: string; lastTransaction: string };
  expensives: { amount: string; lastTransaction: string };
  total: { amount: string; lastTransaction: string };
}

export interface TransactionSummaryOutput {
  transactions: FormattedTransaction[];
  highlightData: HighlightData;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateString: string): string {
  return Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(dateString));
}

export async function getTransactionSummary(userId: string): Promise<TransactionSummaryOutput> {
  const dataKey = `@gofinances:transactions_user${userId}`;
  const response = await AsyncStorage.getItem(dataKey);
  const rawTransactions: RawTransaction[] = response ? JSON.parse(response) : [];

  const summary = calculateSummary(rawTransactions);

  const transactions: FormattedTransaction[] = rawTransactions.map((item) => ({
    id: item.id,
    name: item.name,
    amount: formatCurrency(Number(item.amount)),
    type: item.type,
    category: item.category,
    date: formatDate(item.date),
  }));

  const lastIncomeLabel = formatLastTransactionDate(summary.lastIncomeDate);
  const lastExpenseLabel = formatLastTransactionDate(summary.lastExpenseDate);

  const highlightData: HighlightData = {
    entries: {
      amount: formatCurrency(summary.entriesTotal),
      lastTransaction:
        summary.lastIncomeDate === null ? "Não há transações" : `Última entrada ${lastIncomeLabel}`,
    },
    expensives: {
      amount: formatCurrency(summary.expensesTotal),
      lastTransaction:
        summary.lastExpenseDate === null ? "Não há transações" : `Última saída ${lastExpenseLabel}`,
    },
    total: {
      amount: formatCurrency(summary.balance),
      lastTransaction:
        summary.lastExpenseDate === null ? "Não há transações" : `01 à ${lastExpenseLabel}`,
    },
  };

  return { transactions, highlightData };
}
