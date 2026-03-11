import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import { AccountRepository } from "../../accounts/infra/AccountRepository";
import {
  detectRecurringPatterns,
  projectRecurring,
  projectInstallments,
  buildProjection,
  ProjectionPeriod,
  ProjectedItem,
} from "../domain/cashFlowRules";

const txRepo = new TransactionRepository();
const accountRepo = new AccountRepository();

export interface CashFlowResult {
  current_balance_cents: number;
  periods: ProjectionPeriod[];
}

/**
 * Generates a 30/60/90 day cash flow projection for a user.
 * Uses active account balances + recurring patterns + installments.
 */
export async function getCashFlowProjection(userId: string): Promise<CashFlowResult> {
  const [accounts, transactions] = await Promise.all([
    accountRepo.listByUser(userId),
    txRepo.listByUser(userId),
  ]);

  const activeAccounts = accounts.filter((a) => a.is_active);
  const currentBalance = activeAccounts.reduce((sum, a) => sum + a.balance_cents, 0);

  const baseDate = new Date();
  const allProjected: ProjectedItem[] = [];

  // 1. Project recurring transactions
  const patterns = detectRecurringPatterns(transactions);
  const recurringItems = projectRecurring(patterns, baseDate, 90);
  allProjected.push(...recurringItems);

  // 2. Project remaining installments
  const installmentItems = projectInstallments(transactions, baseDate, 90);
  allProjected.push(...installmentItems);

  // 3. Build 30/60/90 projection
  const periods = buildProjection(currentBalance, allProjected, baseDate);

  return {
    current_balance_cents: currentBalance,
    periods,
  };
}
