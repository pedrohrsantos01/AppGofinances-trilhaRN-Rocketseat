import uuid from "react-native-uuid";
import { Transaction } from "../../../shared/domain/entities/Transaction";
import { addMonths, format } from "date-fns";

export interface InstallmentInput {
  name: string;
  total_amount_cents: number;
  installment_count: number;
  category_id: string;
  account_id: string;
  credit_card_id?: string;
  start_date: string;
  user_id: string;
}

export function generateInstallments(input: InstallmentInput): Transaction[] {
  const {
    name,
    total_amount_cents,
    installment_count,
    category_id,
    account_id,
    credit_card_id,
    start_date,
    user_id,
  } = input;

  if (installment_count < 2) {
    throw new Error("Parcelamento requer pelo menos 2 parcelas");
  }

  if (total_amount_cents <= 0) {
    throw new Error("Valor total deve ser maior que zero");
  }

  const baseAmount = Math.floor(total_amount_cents / installment_count);
  const remainder = total_amount_cents - baseAmount * installment_count;
  const groupId = String(uuid.v4());
  const now = new Date().toISOString();
  const startDateObj = new Date(start_date);

  const transactions: Transaction[] = [];

  for (let i = 0; i < installment_count; i++) {
    const installmentDate = addMonths(startDateObj, i);
    const extra = i < remainder ? 1 : 0;

    transactions.push({
      id: String(uuid.v4()),
      amount_cents: baseAmount + extra,
      currency: "BRL",
      type: "expense",
      status: "confirmed",
      source: "manual",
      name: `${name} (${i + 1}/${installment_count})`,
      category_id,
      account_id,
      credit_card_id,
      installment_group_id: groupId,
      installment_number: i + 1,
      installment_total: installment_count,
      date: format(installmentDate, "yyyy-MM-dd"),
      created_at: now,
      updated_at: now,
      version: 1,
      user_id,
    });
  }

  return transactions;
}
