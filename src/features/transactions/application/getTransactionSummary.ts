import { TransactionRepository } from "../infra/TransactionRepository";
import { Money } from "../../../shared/domain/value-objects/Money";

const transactionRepo = new TransactionRepository();

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

function formatDate(dateString: string): string {
  return Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(dateString));
}

function formatLastDate(txDates: Date[]): string | null {
  if (txDates.length === 0) return null;
  const last = new Date(Math.max(...txDates.map((d) => d.getTime())));
  return `${last.getDate()} de ${last.toLocaleString("pt-BR", { month: "long" })}`;
}

export async function getTransactionSummary(userId: string): Promise<TransactionSummaryOutput> {
  const txs = await transactionRepo.listByUser(userId);

  let entriesTotal = 0;
  let expensesTotal = 0;
  const incomeDates: Date[] = [];
  const expenseDates: Date[] = [];

  const transactions: FormattedTransaction[] = txs.map((tx) => {
    if (tx.type === "income") {
      entriesTotal += tx.amount_cents;
      incomeDates.push(new Date(tx.date));
    } else if (tx.type === "expense") {
      expensesTotal += tx.amount_cents;
      expenseDates.push(new Date(tx.date));
    }

    return {
      id: tx.id,
      name: tx.name,
      amount: Money.fromCents(tx.amount_cents).toFormatted(),
      type: tx.type === "income" ? ("positive" as const) : ("negative" as const),
      category: tx.category_id,
      date: formatDate(tx.date),
    };
  });

  const lastIncome = formatLastDate(incomeDates);
  const lastExpense = formatLastDate(expenseDates);

  const balance = entriesTotal - expensesTotal;

  const highlightData: HighlightData = {
    entries: {
      amount: Money.fromCents(entriesTotal).toFormatted(),
      lastTransaction: lastIncome === null ? "Não há transações" : `Última entrada ${lastIncome}`,
    },
    expensives: {
      amount: Money.fromCents(expensesTotal).toFormatted(),
      lastTransaction: lastExpense === null ? "Não há transações" : `Última saída ${lastExpense}`,
    },
    total: {
      amount: Money.fromCents(balance).toFormatted(),
      lastTransaction: lastExpense === null ? "Não há transações" : `01 à ${lastExpense}`,
    },
  };

  return { transactions, highlightData };
}
