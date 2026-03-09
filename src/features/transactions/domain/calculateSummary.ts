export interface RawTransaction {
  id: string;
  name: string;
  amount: string;
  type: "positive" | "negative";
  category: string;
  date: string;
}

export interface TransactionSummaryResult {
  entriesTotal: number;
  expensesTotal: number;
  balance: number;
  lastIncomeDate: Date | null;
  lastExpenseDate: Date | null;
}

export function calculateSummary(transactions: RawTransaction[]): TransactionSummaryResult {
  let entriesTotal = 0;
  let expensesTotal = 0;
  let lastIncomeDate: Date | null = null;
  let lastExpenseDate: Date | null = null;

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    const date = new Date(transaction.date);

    if (transaction.type === "positive") {
      entriesTotal += amount;
      if (!lastIncomeDate || date > lastIncomeDate) {
        lastIncomeDate = date;
      }
    } else {
      expensesTotal += amount;
      if (!lastExpenseDate || date > lastExpenseDate) {
        lastExpenseDate = date;
      }
    }
  }

  return {
    entriesTotal,
    expensesTotal,
    balance: entriesTotal - expensesTotal,
    lastIncomeDate,
    lastExpenseDate,
  };
}

export function formatLastTransactionDate(date: Date | null): string {
  if (!date) {
    return "Não há transações";
  }
  return `${date.getDate()} de ${date.toLocaleString("pt-BR", { month: "long" })}`;
}
