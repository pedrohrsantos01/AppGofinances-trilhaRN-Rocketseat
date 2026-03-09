export type InvoiceStatus = "open" | "closed" | "paid" | "partially_paid" | "overdue";

export interface Invoice {
  id: string;
  credit_card_id: string;
  reference_month: number;
  reference_year: number;
  total_cents: number;
  paid_cents: number;
  status: InvoiceStatus;
  closing_date: string;
  due_date: string;
  currency: "BRL";
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
