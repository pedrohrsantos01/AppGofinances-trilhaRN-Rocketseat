export interface Budget {
  id: string;
  category_id: string;
  limit_cents: number;
  spent_cents: number;
  month: number;
  year: number;
  rollover: boolean;
  currency: "BRL";
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
