import { BudgetRepository } from "../infra/BudgetRepository";
import { Budget } from "../../../shared/domain/entities/Budget";
import {
  calculateBudgetConsumption,
  checkBudgetAlert,
  BudgetConsumption,
  BudgetAlertLevel,
} from "../domain/budgetRules";

const budgetRepo = new BudgetRepository();

export interface BudgetWithStatus extends Budget {
  consumption: BudgetConsumption;
  alert: BudgetAlertLevel | null;
}

export async function listBudgets(
  userId: string,
  month: number,
  year: number
): Promise<BudgetWithStatus[]> {
  const budgets = await budgetRepo.listByUser(userId, month, year);
  return budgets.map((b) => ({
    ...b,
    consumption: calculateBudgetConsumption(b.limit_cents, b.spent_cents),
    alert: checkBudgetAlert(b.limit_cents, b.spent_cents),
  }));
}
