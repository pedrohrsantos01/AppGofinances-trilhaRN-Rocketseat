export interface CreditCard {
  id: string;
  name: string;
  limit_cents: number;
  closing_day: number;
  due_day: number;
  currency: "BRL";
  color: string;
  is_active: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
