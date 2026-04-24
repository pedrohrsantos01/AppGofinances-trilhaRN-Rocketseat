import { Transaction } from "../../../../shared/domain/entities/Transaction";
import {
  detectRecurringExpenses,
  detectSpendingAnomalies,
  categorizeTrend,
} from "../../../../features/insights/domain/insightRules";

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    amount_cents: 5000,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "manual",
    name: "Netflix",
    category_id: "leisure",
    account_id: "acc-1",
    date: "2026-01-15T00:00:00.000Z",
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
    version: 1,
    user_id: "user1",
    ...overrides,
  };
}

describe("insightRules", () => {
  describe("detectRecurringExpenses", () => {
    it("should detect expense appearing in 3+ months with similar amounts", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-10",
          amount_cents: 3990,
          name: "Netflix",
          category_id: "leisure",
        }),
        makeTx({
          id: "2",
          date: "2026-02-10",
          amount_cents: 3990,
          name: "Netflix",
          category_id: "leisure",
        }),
        makeTx({
          id: "3",
          date: "2026-03-10",
          amount_cents: 3990,
          name: "Netflix",
          category_id: "leisure",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Netflix");
      expect(result[0].category_id).toBe("leisure");
      expect(result[0].average_cents).toBe(3990);
      expect(result[0].occurrences).toBe(3);
    });

    it("should detect with amount tolerance of 10%", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-05",
          amount_cents: 10000,
          name: "Mercado",
          category_id: "food",
        }),
        makeTx({
          id: "2",
          date: "2026-02-05",
          amount_cents: 10500,
          name: "Mercado",
          category_id: "food",
        }),
        makeTx({
          id: "3",
          date: "2026-03-05",
          amount_cents: 9800,
          name: "Mercado",
          category_id: "food",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Mercado");
      expect(result[0].occurrences).toBe(3);
    });

    it("should NOT detect if amounts vary too much (>10%)", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-05",
          amount_cents: 10000,
          name: "Restaurante",
          category_id: "food",
        }),
        makeTx({
          id: "2",
          date: "2026-02-05",
          amount_cents: 20000,
          name: "Restaurante",
          category_id: "food",
        }),
        makeTx({
          id: "3",
          date: "2026-03-05",
          amount_cents: 5000,
          name: "Restaurante",
          category_id: "food",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(0);
    });

    it("should NOT detect with fewer than 3 occurrences", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-10",
          amount_cents: 3990,
          name: "Netflix",
          category_id: "leisure",
        }),
        makeTx({
          id: "2",
          date: "2026-02-10",
          amount_cents: 3990,
          name: "Netflix",
          category_id: "leisure",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(0);
    });

    it("should ignore income transactions", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-05",
          amount_cents: 500000,
          name: "Salario",
          type: "income",
        }),
        makeTx({
          id: "2",
          date: "2026-02-05",
          amount_cents: 500000,
          name: "Salario",
          type: "income",
        }),
        makeTx({
          id: "3",
          date: "2026-03-05",
          amount_cents: 500000,
          name: "Salario",
          type: "income",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(0);
    });

    it("should group by name+category (same name different category = separate)", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-05",
          amount_cents: 5000,
          name: "Uber",
          category_id: "car",
        }),
        makeTx({
          id: "2",
          date: "2026-02-05",
          amount_cents: 5000,
          name: "Uber",
          category_id: "car",
        }),
        makeTx({
          id: "3",
          date: "2026-03-05",
          amount_cents: 5000,
          name: "Uber",
          category_id: "car",
        }),
        makeTx({
          id: "4",
          date: "2026-01-10",
          amount_cents: 3000,
          name: "Uber",
          category_id: "food",
        }),
        makeTx({
          id: "5",
          date: "2026-02-10",
          amount_cents: 3000,
          name: "Uber",
          category_id: "food",
        }),
        makeTx({
          id: "6",
          date: "2026-03-10",
          amount_cents: 3000,
          name: "Uber",
          category_id: "food",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(2);
    });

    it("should require occurrences in different months", () => {
      const txs: Transaction[] = [
        makeTx({
          id: "1",
          date: "2026-01-05",
          amount_cents: 5000,
          name: "Cafe",
          category_id: "food",
        }),
        makeTx({
          id: "2",
          date: "2026-01-15",
          amount_cents: 5000,
          name: "Cafe",
          category_id: "food",
        }),
        makeTx({
          id: "3",
          date: "2026-01-25",
          amount_cents: 5000,
          name: "Cafe",
          category_id: "food",
        }),
      ];

      const result = detectRecurringExpenses(txs);
      expect(result).toHaveLength(0);
    });
  });

  describe("detectSpendingAnomalies", () => {
    it("should flag category where current month exceeds average by >50%", () => {
      const currentMonth: Transaction[] = [
        makeTx({ id: "1", amount_cents: 30000, category_id: "food" }),
      ];
      const previousMonths: Transaction[][] = [
        [makeTx({ id: "2", amount_cents: 10000, category_id: "food" })],
        [makeTx({ id: "3", amount_cents: 12000, category_id: "food" })],
        [makeTx({ id: "4", amount_cents: 11000, category_id: "food" })],
      ];

      const result = detectSpendingAnomalies(currentMonth, previousMonths);
      expect(result).toHaveLength(1);
      expect(result[0].category_id).toBe("food");
      expect(result[0].current_cents).toBe(30000);
      expect(result[0].percent_above).toBeGreaterThan(50);
    });

    it("should NOT flag when spending is within normal range", () => {
      const currentMonth: Transaction[] = [
        makeTx({ id: "1", amount_cents: 12000, category_id: "food" }),
      ];
      const previousMonths: Transaction[][] = [
        [makeTx({ id: "2", amount_cents: 10000, category_id: "food" })],
        [makeTx({ id: "3", amount_cents: 11000, category_id: "food" })],
        [makeTx({ id: "4", amount_cents: 12000, category_id: "food" })],
      ];

      const result = detectSpendingAnomalies(currentMonth, previousMonths);
      expect(result).toHaveLength(0);
    });

    it("should handle multiple categories independently", () => {
      const currentMonth: Transaction[] = [
        makeTx({ id: "1", amount_cents: 30000, category_id: "food" }),
        makeTx({ id: "2", amount_cents: 5000, category_id: "leisure" }),
      ];
      const previousMonths: Transaction[][] = [
        [
          makeTx({ id: "3", amount_cents: 10000, category_id: "food" }),
          makeTx({ id: "4", amount_cents: 5000, category_id: "leisure" }),
        ],
        [
          makeTx({ id: "5", amount_cents: 11000, category_id: "food" }),
          makeTx({ id: "6", amount_cents: 4500, category_id: "leisure" }),
        ],
      ];

      const result = detectSpendingAnomalies(currentMonth, previousMonths);
      expect(result).toHaveLength(1);
      expect(result[0].category_id).toBe("food");
    });

    it("should return empty when no previous data", () => {
      const currentMonth: Transaction[] = [
        makeTx({ id: "1", amount_cents: 30000, category_id: "food" }),
      ];

      const result = detectSpendingAnomalies(currentMonth, []);
      expect(result).toHaveLength(0);
    });

    it("should only consider expense transactions", () => {
      const currentMonth: Transaction[] = [
        makeTx({ id: "1", amount_cents: 500000, category_id: "salary", type: "income" }),
      ];
      const previousMonths: Transaction[][] = [
        [makeTx({ id: "2", amount_cents: 100000, category_id: "salary", type: "income" })],
      ];

      const result = detectSpendingAnomalies(currentMonth, previousMonths);
      expect(result).toHaveLength(0);
    });
  });

  describe("categorizeTrend", () => {
    it("should return 'up' when current > previous by more than 5%", () => {
      expect(categorizeTrend(11000, 10000)).toBe("up");
    });

    it("should return 'down' when current < previous by more than 5%", () => {
      expect(categorizeTrend(9000, 10000)).toBe("down");
    });

    it("should return 'stable' when difference is within 5%", () => {
      expect(categorizeTrend(10200, 10000)).toBe("stable");
      expect(categorizeTrend(9800, 10000)).toBe("stable");
    });

    it("should return 'stable' when both are zero", () => {
      expect(categorizeTrend(0, 0)).toBe("stable");
    });

    it("should return 'up' when previous is zero and current is positive", () => {
      expect(categorizeTrend(5000, 0)).toBe("up");
    });
  });
});
