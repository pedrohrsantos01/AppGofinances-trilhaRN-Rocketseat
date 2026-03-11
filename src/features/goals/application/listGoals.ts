import { Goal, GoalStatus } from "../../../shared/domain/entities/Goal";
import { GoalRepository } from "../infra/GoalRepository";

const goalRepo = new GoalRepository();

export async function listGoals(userId: string, status?: GoalStatus): Promise<Goal[]> {
  return goalRepo.listByUser(userId, status);
}
