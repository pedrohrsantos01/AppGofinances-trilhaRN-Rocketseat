import {
  aggregateByCategory,
  RawTransaction,
} from "../../../features/resume/domain/aggregateByCategory";

function makeExpense(overrides: Partial<RawTransaction> = {}): RawTransaction {
  return {
    type: "negative",
    name: "Test",
    amount: "100",
    category: "food",
    date: "2025-03-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("aggregateByCategory", () => {
  it("should return empty array for no transactions", () => {
    const result = aggregateByCategory([], 2, 2025);
    expect(result).toEqual([]);
  });

  it("should filter by month and year", () => {
    const transactions = [
      makeExpense({ date: "2025-03-15T10:00:00.000Z", amount: "100" }),
      makeExpense({ date: "2025-04-15T10:00:00.000Z", amount: "200" }),
    ];

    const result = aggregateByCategory(transactions, 2, 2025); // March = month index 2
    expect(result.length).toBe(1);
    expect(result[0].total).toBe(100);
  });

  it("should ignore income transactions", () => {
    const transactions = [
      makeExpense({ type: "positive", amount: "5000", category: "salary" }),
      makeExpense({ amount: "100", category: "food" }),
    ];

    const result = aggregateByCategory(transactions, 2, 2025);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe("food");
  });

  it("should group by category correctly", () => {
    const transactions = [
      makeExpense({ amount: "100", category: "food" }),
      makeExpense({ amount: "200", category: "food" }),
      makeExpense({ amount: "300", category: "car" }),
    ];

    const result = aggregateByCategory(transactions, 2, 2025);

    const food = result.find((c) => c.key === "food");
    const car = result.find((c) => c.key === "car");

    expect(food).toBeDefined();
    expect(food!.total).toBe(300);
    expect(car).toBeDefined();
    expect(car!.total).toBe(300);
  });

  it("should calculate percentages correctly", () => {
    const transactions = [
      makeExpense({ amount: "750", category: "food" }),
      makeExpense({ amount: "250", category: "car" }),
    ];

    const result = aggregateByCategory(transactions, 2, 2025);

    const food = result.find((c) => c.key === "food");
    const car = result.find((c) => c.key === "car");

    expect(food!.percent).toBe("75%");
    expect(car!.percent).toBe("25%");
  });

  it("should include category name and color", () => {
    const transactions = [makeExpense({ amount: "100", category: "food" })];

    const result = aggregateByCategory(transactions, 2, 2025);

    expect(result[0].name).toBe("Alimentação");
    expect(result[0].color).toBe("#FF872C");
  });

  it("should exclude categories with zero total", () => {
    const transactions = [makeExpense({ amount: "100", category: "food" })];

    const result = aggregateByCategory(transactions, 2, 2025);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe("food");
  });

  it("should format total as BRL currency", () => {
    const transactions = [makeExpense({ amount: "1500.50", category: "food" })];

    const result = aggregateByCategory(transactions, 2, 2025);
    expect(result[0].totalFormatted).toContain("1.500,50");
  });
});
