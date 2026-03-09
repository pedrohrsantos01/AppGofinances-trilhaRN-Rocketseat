export interface Transaction {
  id: string;
  amount_cents: number;
  currency: "BRL";
  type: "income" | "expense" | "transfer";
  status: "confirmed" | "pending" | "cancelled";
  source: "manual" | "import" | "recurring" | "open_finance";
  name: string;
  category_id: string;
  account_id: string;
  credit_card_id?: string;
  recurring_rule_id?: string;
  installment_group_id?: string;
  installment_number?: number;
  installment_total?: number;
  date: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
