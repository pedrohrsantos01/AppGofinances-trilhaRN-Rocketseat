import { AppError } from "../../../shared/domain/errors/AppError";
import { Goal } from "../../../shared/domain/entities/Goal";
import { GoalRepository } from "../infra/GoalRepository";

const goalRepo = new GoalRepository();

export async function contributeToGoal(goalId: string, amountCents: number): Promise<Goal> {
  if (amountCents <= 0) {
    throw new AppError("VALIDATION_ERROR", "Valor deve ser maior que zero");
  }

  const goal = await goalRepo.getById(goalId);
  if (!goal) {
    throw new AppError("NOT_FOUND", "Meta nao encontrada");
  }
  if (goal.status !== "active") {
    throw new AppError("VALIDATION_ERROR", "Apenas metas ativas aceitam contribuicoes");
  }

  const updated = await goalRepo.contribute(goalId, amountCents);
  if (!updated) {
    throw new AppError("STORAGE_ERROR", "Erro ao atualizar meta");
  }

  if (updated.current_cents >= updated.target_cents && updated.status === "active") {
    await goalRepo.update({ ...updated, status: "completed" });
    return { ...updated, status: "completed" };
  }

  return updated;
}
