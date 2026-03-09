import {
  generateRecurringTransactions,
  RecurringInput,
} from "../../../../features/transactions/domain/recurring";

describe("generateRecurringTransactions", () => {
  const baseInput: RecurringInput = {
    name: "Netflix",
    amount_cents: 5590,
    type: "expense",
    category_id: "leisure",
    account_id: "acc-1",
    frequency: "monthly",
    start_date: "2025-01-10",
    end_date: "2025-04-10",
    user_id: "user-1",
  };

  it("should generate monthly transactions between start and end", () => {
    const result = generateRecurringTransactions(baseInput);
    expect(result).toHaveLength(4); // Jan, Feb, Mar, Apr
  });

  it("should set correct amounts", () => {
    const result = generateRecurringTransactions(baseInput);
    result.forEach((t) => expect(t.amount_cents).toBe(5590));
  });

  it("should set source as 'recurring'", () => {
    const result = generateRecurringTransactions(baseInput);
    result.forEach((t) => expect(t.source).toBe("recurring"));
  });

  it("should share the same recurring_rule_id", () => {
    const result = generateRecurringTransactions(baseInput);
    const ruleId = result[0].recurring_rule_id;
    expect(ruleId).toBeDefined();
    expect(result.every((t) => t.recurring_rule_id === ruleId)).toBe(true);
  });

  it("should set dates monthly apart", () => {
    const result = generateRecurringTransactions(baseInput);
    expect(result[0].date).toContain("2025-01");
    expect(result[1].date).toContain("2025-02");
    expect(result[2].date).toContain("2025-03");
    expect(result[3].date).toContain("2025-04");
  });

  it("should generate weekly transactions", () => {
    const input: RecurringInput = {
      ...baseInput,
      frequency: "weekly",
      start_date: "2025-03-01",
      end_date: "2025-03-22",
    };

    const result = generateRecurringTransactions(input);
    expect(result).toHaveLength(4); // Mar 1, 8, 15, 22
  });

  it("should generate yearly transactions", () => {
    const input: RecurringInput = {
      ...baseInput,
      frequency: "yearly",
      start_date: "2024-06-15",
      end_date: "2026-06-15",
    };

    const result = generateRecurringTransactions(input);
    expect(result).toHaveLength(3); // 2024, 2025, 2026
  });

  it("should handle income type", () => {
    const input = { ...baseInput, type: "income" as const };
    const result = generateRecurringTransactions(input);
    result.forEach((t) => expect(t.type).toBe("income"));
  });

  it("should generate nothing when end_date is before start_date", () => {
    const input = { ...baseInput, end_date: "2024-12-01" };
    const result = generateRecurringTransactions(input);
    expect(result).toHaveLength(0);
  });

  it("should generate single when start equals end", () => {
    const input = { ...baseInput, end_date: "2025-01-10" };
    const result = generateRecurringTransactions(input);
    expect(result).toHaveLength(1);
  });
});
