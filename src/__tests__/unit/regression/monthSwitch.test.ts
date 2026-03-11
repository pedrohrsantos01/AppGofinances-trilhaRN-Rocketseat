import {
  aggregateByCategory,
  RawTransaction,
} from "../../../features/resume/domain/aggregateByCategory";

/**
 * Regression tests: CLAUDE.md Section 11.3
 * Month switch in resume must not break totals or contaminate other months.
 */

const transactions: RawTransaction[] = [
  {
    type: "negative",
    amount: "300",
    category: "food",
    name: "Mercado",
    date: "2026-02-15T00:00:00.000Z",
  },
  {
    type: "negative",
    amount: "500",
    category: "food",
    name: "Mercado",
    date: "2026-03-10T00:00:00.000Z",
  },
  {
    type: "negative",
    amount: "200",
    category: "car",
    name: "Gasolina",
    date: "2026-03-20T00:00:00.000Z",
  },
  {
    type: "negative",
    amount: "100",
    category: "leisure",
    name: "Cinema",
    date: "2026-04-05T00:00:00.000Z",
  },
];

describe("Regression: month switch in resume", () => {
  it("should show only February expenses for February", () => {
    const result = aggregateByCategory(transactions, 1, 2026); // Feb = 1
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("food");
    expect(result[0].total).toBe(300);
  });

  it("should show only March expenses for March", () => {
    const result = aggregateByCategory(transactions, 2, 2026); // Mar = 2
    expect(result).toHaveLength(2);

    const food = result.find((c) => c.key === "food");
    const car = result.find((c) => c.key === "car");
    expect(food?.total).toBe(500);
    expect(car?.total).toBe(200);
  });

  it("should show only April expenses for April", () => {
    const result = aggregateByCategory(transactions, 3, 2026); // Apr = 3
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("leisure");
    expect(result[0].total).toBe(100);
  });

  it("should show empty for month with no transactions", () => {
    const result = aggregateByCategory(transactions, 0, 2026); // Jan = 0
    expect(result).toHaveLength(0);
  });

  it("should maintain correct percentages per month", () => {
    const result = aggregateByCategory(transactions, 2, 2026); // Mar
    const food = result.find((c) => c.key === "food");
    const car = result.find((c) => c.key === "car");

    // Food: 500/700 ≈ 71%, Car: 200/700 ≈ 29%
    expect(food?.percent).toBe("71%");
    expect(car?.percent).toBe("29%");
  });

  it("should not contaminate previous month totals when switching months", () => {
    const feb = aggregateByCategory(transactions, 1, 2026);
    const mar = aggregateByCategory(transactions, 2, 2026);

    const febTotal = feb.reduce((s, c) => s + c.total, 0);
    const marTotal = mar.reduce((s, c) => s + c.total, 0);

    expect(febTotal).toBe(300);
    expect(marTotal).toBe(700);
    expect(febTotal + marTotal).not.toBe(transactions.reduce((s, t) => s + Number(t.amount), 0));
  });
});
