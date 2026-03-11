export type InsightType = "recurring_expense" | "spending_anomaly" | "category_trend";
export type InsightSeverity = "info" | "warning" | "alert";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: InsightSeverity;
  category_id?: string;
  amount_cents?: number;
  reference_month: string; // YYYY-MM
  created_at: string;
  user_id: string;
}
