import {
  calculateSummary,
  RawTransaction,
} from "../../../features/transactions/domain/calculateSummary";
import { aggregateByCategory } from "../../../features/resume/domain/aggregateByCategory";

/**
 * Regression tests: CLAUDE.md Section 11.2
 * Creation and update of transaction with reflection in dashboard and resume.
 */

function makeRawTx(overrides: Partial<RawTransaction>): RawTransaction {
  return {
    id: "tx-1",
    name: "Test",
    amount: "100",
    type: "positive",
    category: "salary",
    date: "2026-03-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("Regression: transaction → dashboard → resume consistency", () => {
  it("should reflect new income in summary totals", () => {
    const txs = [
      makeRawTx({ id: "1", type: "positive", amount: "5000" }),
      makeRawTx({ id: "2", type: "negative", amount: "2000", category: "food" }),
    ];

    const summary = calculateSummary(txs);
    expect(summary.entriesTotal).toBe(5000);
    expect(summary.expensesTotal).toBe(2000);
    expect(summary.balance).toBe(3000);
  });

  it("should update totals after adding a new expense", () => {
    const initial = [makeRawTx({ id: "1", type: "positive", amount: "5000" })];
    const afterExpense = [
      ...initial,
      makeRawTx({ id: "2", type: "negative", amount: "1500", category: "food" }),
    ];

    const before = calculateSummary(initial);
    const after = calculateSummary(afterExpense);

    expect(before.balance).toBe(5000);
    expect(after.balance).toBe(3500);
    expect(after.expensesTotal).toBe(1500);
  });

  it("should update totals after deleting a transaction", () => {
    const txs = [
      makeRawTx({ id: "1", type: "positive", amount: "5000" }),
      makeRawTx({ id: "2", type: "negative", amount: "2000", category: "food" }),
      makeRawTx({ id: "3", type: "negative", amount: "1000", category: "car" }),
    ];

    const afterDelete = txs.filter((tx) => tx.id !== "2");
    const summary = calculateSummary(afterDelete);

    expect(summary.expensesTotal).toBe(1000);
    expect(summary.balance).toBe(4000);
  });

  it("should keep resume category totals consistent with dashboard expenses", () => {
    const txs = [
      makeRawTx({
        id: "1",
        type: "negative",
        amount: "300",
        category: "food",
        date: "2026-03-15T00:00:00.000Z",
      }),
      makeRawTx({
        id: "2",
        type: "negative",
        amount: "200",
        category: "car",
        date: "2026-03-10T00:00:00.000Z",
      }),
      makeRawTx({
        id: "3",
        type: "negative",
        amount: "500",
        category: "leisure",
        date: "2026-03-20T00:00:00.000Z",
      }),
    ];

    const summary = calculateSummary(txs);
    const categories = aggregateByCategory(txs, 2, 2026); // March = month 2 (0-indexed)
    const categoryTotal = categories.reduce((sum, c) => sum + c.total, 0);

    // Category totals must match dashboard expense total
    expect(categoryTotal).toBe(summary.expensesTotal);
  });

  it("should not count income in category aggregation", () => {
    const txs = [
      makeRawTx({
        id: "1",
        type: "positive",
        amount: "5000",
        category: "salary",
        date: "2026-03-05T00:00:00.000Z",
      }),
      makeRawTx({
        id: "2",
        type: "negative",
        amount: "200",
        category: "food",
        date: "2026-03-10T00:00:00.000Z",
      }),
    ];

    const categories = aggregateByCategory(txs, 2, 2026);
    expect(categories).toHaveLength(1);
    expect(categories[0].key).toBe("food");
    expect(categories[0].total).toBe(200);
  });
});
