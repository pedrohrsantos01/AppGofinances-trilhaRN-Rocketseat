import uuid from "react-native-uuid";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { RecurringFrequency } from "../../../shared/domain/entities/RecurringRule";
import { addMonths, addWeeks, addYears, addDays, format, isBefore, isEqual } from "date-fns";

export interface RecurringInput {
  name: string;
  amount_cents: number;
  type: "income" | "expense";
  category_id: string;
  account_id: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string;
  user_id: string;
}

function advanceDate(date: Date, frequency: RecurringFrequency): Date {
  switch (frequency) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "yearly":
      return addYears(date, 1);
  }
}

export function generateRecurringTransactions(input: RecurringInput): Transaction[] {
  const {
    name,
    amount_cents,
    type,
    category_id,
    account_id,
    frequency,
    start_date,
    end_date,
    user_id,
  } = input;

  const ruleId = String(uuid.v4());
  const now = new Date().toISOString();
  const endDateObj = new Date(end_date);
  const transactions: Transaction[] = [];

  let current = new Date(start_date);

  while (isBefore(current, endDateObj) || isEqual(current, endDateObj)) {
    transactions.push({
      id: String(uuid.v4()),
      amount_cents,
      currency: "BRL",
      type,
      status: "confirmed",
      source: "recurring",
      name,
      category_id,
      account_id,
      recurring_rule_id: ruleId,
      date: format(current, "yyyy-MM-dd"),
      created_at: now,
      updated_at: now,
      version: 1,
      user_id,
    });

    current = advanceDate(current, frequency);
  }

  return transactions;
}
