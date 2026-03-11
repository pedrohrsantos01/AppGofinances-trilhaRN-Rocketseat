import { Transaction } from "../../../../shared/domain/entities/Transaction";
import {
  detectRecurringPatterns,
  projectRecurring,
  projectInstallments,
  buildProjection,
  ProjectionPeriod,
} from "../../../../features/cashflow/domain/cashFlowRules";

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    amount_cents: 5000,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "manual",
    name: "Test",
    category_id: "food",
    account_id: "acc-1",
    date: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
    version: 1,
    user_id: "user1",
    ...overrides,
  };
}

describe("cashFlowRules", () => {
  describe("detectRecurringPatterns", () => {
    it("should detect monthly recurring by recurring_rule_id", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-01-10",
          amount_cents: 3990,
          name: "Netflix",
          type: "expense",
        }),
        makeTx({
          id: "2",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-02-10",
          amount_cents: 3990,
          name: "Netflix",
          type: "expense",
        }),
        makeTx({
          id: "3",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-03-10",
          amount_cents: 3990,
          name: "Netflix",
          type: "expense",
        }),
      ];

      const patterns = detectRecurringPatterns(txs);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].name).toBe("Netflix");
      expect(patterns[0].amount_cents).toBe(3990);
      expect(patterns[0].type).toBe("expense");
      expect(patterns[0].frequency).toBe("monthly");
    });

    it("should detect income recurring patterns", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          recurring_rule_id: "rule-2",
          source: "recurring",
          date: "2026-01-05",
          amount_cents: 500000,
          name: "Salario",
          type: "income",
        }),
        makeTx({
          id: "2",
          recurring_rule_id: "rule-2",
          source: "recurring",
          date: "2026-02-05",
          amount_cents: 500000,
          name: "Salario",
          type: "income",
        }),
        makeTx({
          id: "3",
          recurring_rule_id: "rule-2",
          source: "recurring",
          date: "2026-03-05",
          amount_cents: 500000,
          name: "Salario",
          type: "income",
        }),
      ];

      const patterns = detectRecurringPatterns(txs);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe("income");
      expect(patterns[0].amount_cents).toBe(500000);
    });

    it("should use most recent amount when amounts vary", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-01-10",
          amount_cents: 3990,
          name: "Netflix",
        }),
        makeTx({
          id: "2",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-02-10",
          amount_cents: 4490,
          name: "Netflix",
        }),
        makeTx({
          id: "3",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-03-10",
          amount_cents: 4490,
          name: "Netflix",
        }),
      ];

      const patterns = detectRecurringPatterns(txs);
      expect(patterns[0].amount_cents).toBe(4490);
    });

    it("should require at least 2 occurrences", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          recurring_rule_id: "rule-1",
          source: "recurring",
          date: "2026-03-10",
          amount_cents: 3990,
          name: "Netflix",
        }),
      ];

      const patterns = detectRecurringPatterns(txs);
      expect(patterns).toHaveLength(0);
    });
  });

  describe("projectRecurring", () => {
    it("should project monthly recurring expenses for 30 days", () => {
      const baseDate = new Date("2026-03-15");
      const patterns = [
        {
          name: "Netflix",
          amount_cents: 3990,
          type: "expense" as const,
          frequency: "monthly" as const,
          typical_day: 10,
          category_id: "leisure",
        },
      ];

      const projected = projectRecurring(patterns, baseDate, 30);
      // Next occurrence: April 10 (within 30 days from March 15)
      expect(projected).toHaveLength(1);
      expect(projected[0].amount_cents).toBe(3990);
      expect(projected[0].type).toBe("expense");
    });

    it("should project multiple occurrences for 90 days", () => {
      const baseDate = new Date("2026-03-15");
      const patterns = [
        {
          name: "Netflix",
          amount_cents: 3990,
          type: "expense" as const,
          frequency: "monthly" as const,
          typical_day: 10,
          category_id: "leisure",
        },
      ];

      const projected = projectRecurring(patterns, baseDate, 90);
      // Apr 10, May 10, Jun 10 = 3 occurrences
      expect(projected).toHaveLength(3);
    });

    it("should project income recurring", () => {
      const baseDate = new Date("2026-03-15");
      const patterns = [
        {
          name: "Salario",
          amount_cents: 500000,
          type: "income" as const,
          frequency: "monthly" as const,
          typical_day: 5,
          category_id: "salary",
        },
      ];

      const projected = projectRecurring(patterns, baseDate, 30);
      expect(projected).toHaveLength(1);
      expect(projected[0].type).toBe("income");
      expect(projected[0].amount_cents).toBe(500000);
    });

    it("should return empty for 0 days", () => {
      const patterns = [
        {
          name: "Netflix",
          amount_cents: 3990,
          type: "expense" as const,
          frequency: "monthly" as const,
          typical_day: 10,
          category_id: "leisure",
        },
      ];

      const projected = projectRecurring(patterns, new Date("2026-03-15"), 0);
      expect(projected).toHaveLength(0);
    });
  });

  describe("projectInstallments", () => {
    it("should project remaining installments within window", () => {
      const baseDate = new Date("2026-03-15");
      // Installment 3/6 already paid, 4/6, 5/6, 6/6 remaining
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          installment_group_id: "inst-1",
          installment_number: 1,
          installment_total: 6,
          date: "2026-01-10",
          amount_cents: 10000,
          name: "TV",
        }),
        makeTx({
          id: "2",
          installment_group_id: "inst-1",
          installment_number: 2,
          installment_total: 6,
          date: "2026-02-10",
          amount_cents: 10000,
          name: "TV",
        }),
        makeTx({
          id: "3",
          installment_group_id: "inst-1",
          installment_number: 3,
          installment_total: 6,
          date: "2026-03-10",
          amount_cents: 10000,
          name: "TV",
        }),
      ];

      const projected = projectInstallments(txs, baseDate, 90);
      // Remaining: 4/6 (Apr 10), 5/6 (May 10), 6/6 (Jun 10)
      expect(projected).toHaveLength(3);
      expect(projected[0].amount_cents).toBe(10000);
      expect(projected[0].name).toContain("TV");
    });

    it("should not project completed installments", () => {
      const baseDate = new Date("2026-03-15");
      // All 3/3 installments already exist
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          installment_group_id: "inst-1",
          installment_number: 1,
          installment_total: 3,
          date: "2026-01-10",
          amount_cents: 10000,
          name: "TV",
        }),
        makeTx({
          id: "2",
          installment_group_id: "inst-1",
          installment_number: 2,
          installment_total: 3,
          date: "2026-02-10",
          amount_cents: 10000,
          name: "TV",
        }),
        makeTx({
          id: "3",
          installment_group_id: "inst-1",
          installment_number: 3,
          installment_total: 3,
          date: "2026-03-10",
          amount_cents: 10000,
          name: "TV",
        }),
      ];

      const projected = projectInstallments(txs, baseDate, 90);
      expect(projected).toHaveLength(0);
    });

    it("should limit projection to window", () => {
      const baseDate = new Date("2026-03-15");
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          installment_group_id: "inst-1",
          installment_number: 1,
          installment_total: 12,
          date: "2026-03-10",
          amount_cents: 5000,
          name: "Curso",
        }),
      ];

      // 30 days: only April 10 fits
      const projected = projectInstallments(txs, baseDate, 30);
      expect(projected).toHaveLength(1);
    });
  });

  describe("buildProjection", () => {
    it("should calculate projected balance for each period", () => {
      const currentBalance = 100000; // R$1000
      const projectedItems = [
        { date: "2026-04-05", amount_cents: 500000, type: "income" as const, name: "Salario" },
        { date: "2026-04-10", amount_cents: 3990, type: "expense" as const, name: "Netflix" },
        { date: "2026-04-15", amount_cents: 50000, type: "expense" as const, name: "Mercado" },
      ];

      const result = buildProjection(currentBalance, projectedItems, new Date("2026-03-15"));

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe("30 dias");
      expect(result[1].label).toBe("60 dias");
      expect(result[2].label).toBe("90 dias");

      // 30-day (Mar 15 → Apr 14): Salario + Netflix (Mercado Apr 15 outside window)
      // 100000 + 500000 - 3990 = 596010
      expect(result[0].projected_balance_cents).toBe(596010);
    });

    it("should split items correctly into 30/60/90 day buckets", () => {
      const projectedItems = [
        { date: "2026-04-01", amount_cents: 10000, type: "income" as const, name: "A" },
        { date: "2026-05-01", amount_cents: 20000, type: "expense" as const, name: "B" },
        { date: "2026-06-01", amount_cents: 30000, type: "income" as const, name: "C" },
      ];

      const result = buildProjection(0, projectedItems, new Date("2026-03-15"));
      // 30 days (Mar 15 → Apr 14): A (+10000) → 10000
      expect(result[0].projected_balance_cents).toBe(10000);
      expect(result[0].income_cents).toBe(10000);
      expect(result[0].expense_cents).toBe(0);

      // 60 days (Mar 15 → May 14): A + B → 10000 - 20000 = -10000
      expect(result[1].projected_balance_cents).toBe(-10000);

      // 90 days (Mar 15 → Jun 13): A + B + C → -10000 + 30000 = 20000
      expect(result[2].projected_balance_cents).toBe(20000);
    });

    it("should handle empty projected items", () => {
      const result = buildProjection(50000, [], new Date("2026-03-15"));
      expect(result).toHaveLength(3);
      expect(result[0].projected_balance_cents).toBe(50000);
      expect(result[1].projected_balance_cents).toBe(50000);
      expect(result[2].projected_balance_cents).toBe(50000);
    });

    it("should handle negative balance", () => {
      const projectedItems = [
        { date: "2026-04-01", amount_cents: 200000, type: "expense" as const, name: "Big" },
      ];

      const result = buildProjection(100000, projectedItems, new Date("2026-03-15"));
      expect(result[0].projected_balance_cents).toBe(-100000);
    });
  });
});
