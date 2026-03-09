import { Transaction } from "../../domain/entities/Transaction";

export interface TransactionSummary {
  income_cents: number;
  expense_cents: number;
  balance_cents: number;
  last_income_date?: string;
  last_expense_date?: string;
}

export interface TransactionFilter {
  user_id: string;
  type?: Transaction["type"];
  status?: Transaction["status"];
  category_id?: string;
  account_id?: string;
  month?: number;
  year?: number;
  start_date?: string;
  end_date?: string;
}

export interface TransactionService {
  create(
    transaction: Omit<Transaction, "created_at" | "updated_at" | "version">
  ): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Transaction | null>;
  listByUser(filter: TransactionFilter): Promise<Transaction[]>;
  getSummary(filter: TransactionFilter): Promise<TransactionSummary>;
}
