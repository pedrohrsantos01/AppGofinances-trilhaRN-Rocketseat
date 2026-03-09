export type GoalStatus = "active" | "completed" | "cancelled" | "paused";

export interface Goal {
  id: string;
  name: string;
  target_cents: number;
  current_cents: number;
  currency: "BRL";
  status: GoalStatus;
  target_date?: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string;
}
