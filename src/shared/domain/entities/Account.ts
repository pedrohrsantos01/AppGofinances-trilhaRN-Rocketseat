export type AccountType = "checking" | "savings" | "cash" | "investment" | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance_cents: number;
  currency: "BRL";
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
