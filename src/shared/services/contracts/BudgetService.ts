import { Budget } from "../../domain/entities/Budget";

export interface BudgetService {
  create(
    budget: Omit<Budget, "created_at" | "updated_at" | "version" | "spent_cents">
  ): Promise<Budget>;
  update(id: string, data: Partial<Budget>): Promise<Budget>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Budget | null>;
  listByUser(userId: string, month: number, year: number): Promise<Budget[]>;
  getConsumption(
    id: string
  ): Promise<{ limit_cents: number; spent_cents: number; percent: number }>;
}
