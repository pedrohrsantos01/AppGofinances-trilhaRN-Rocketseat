import uuid from "react-native-uuid";
import { AppError } from "../../../shared/domain/errors/AppError";
import { Goal } from "../../../shared/domain/entities/Goal";
import { GoalRepository } from "../infra/GoalRepository";

const goalRepo = new GoalRepository();

interface CreateGoalInput {
  name: string;
  target_cents: number;
  target_date?: string;
  color?: string;
  icon?: string;
  user_id: string;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  if (!input.name.trim()) {
    throw new AppError("VALIDATION_ERROR", "Nome da meta e obrigatorio");
  }
  if (input.target_cents <= 0) {
    throw new AppError("VALIDATION_ERROR", "Valor da meta deve ser maior que zero");
  }

  const now = new Date().toISOString();
  const goal: Goal = {
    id: String(uuid.v4()),
    name: input.name.trim(),
    target_cents: input.target_cents,
    current_cents: 0,
    currency: "BRL",
    status: "active",
    target_date: input.target_date,
    color: input.color ?? "#5636D3",
    icon: input.icon ?? "flag",
    created_at: now,
    updated_at: now,
    version: 1,
    user_id: input.user_id,
  };

  return goalRepo.create(goal);
}
