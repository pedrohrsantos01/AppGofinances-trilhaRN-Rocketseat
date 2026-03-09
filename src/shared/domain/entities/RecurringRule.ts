export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  name: string;
  amount_cents: number;
  currency: "BRL";
  type: "income" | "expense";
  category_id: string;
  account_id: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  last_generated_date?: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
