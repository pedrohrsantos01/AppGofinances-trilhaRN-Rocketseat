import uuid from "react-native-uuid";
import { AppError } from "../../../shared/domain/errors/AppError";
import { Budget } from "../../../shared/domain/entities/Budget";
import { BudgetRepository } from "../infra/BudgetRepository";

const budgetRepo = new BudgetRepository();

interface CreateBudgetInput {
  category_id: string;
  limit_cents: number;
  month: number;
  year: number;
  rollover: boolean;
  user_id: string;
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  if (!input.category_id) {
    throw new AppError("VALIDATION_ERROR", "Categoria é obrigatória");
  }
  if (input.limit_cents <= 0) {
    throw new AppError("VALIDATION_ERROR", "Limite deve ser maior que zero");
  }

  const now = new Date().toISOString();
  const budget: Budget = {
    id: String(uuid.v4()),
    category_id: input.category_id,
    limit_cents: input.limit_cents,
    spent_cents: 0,
    month: input.month,
    year: input.year,
    rollover: input.rollover,
    currency: "BRL",
    created_at: now,
    updated_at: now,
    version: 1,
    user_id: input.user_id,
  };

  return budgetRepo.upsert(budget);
}
