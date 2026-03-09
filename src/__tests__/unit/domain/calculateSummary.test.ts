import {
  calculateSummary,
  formatLastTransactionDate,
  RawTransaction,
} from "../../../features/transactions/domain/calculateSummary";

function makeTransaction(overrides: Partial<RawTransaction> = {}): RawTransaction {
  return {
    id: "1",
    name: "Test",
    amount: "100",
    type: "positive",
    category: "salary",
    date: "2025-01-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("calculateSummary", () => {
  it("should return zeros for empty list", () => {
    const result = calculateSummary([]);

    expect(result.entriesTotal).toBe(0);
    expect(result.expensesTotal).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.lastIncomeDate).toBeNull();
    expect(result.lastExpenseDate).toBeNull();
  });

  it("should sum income transactions correctly", () => {
    const transactions = [
      makeTransaction({ amount: "1000", type: "positive" }),
      makeTransaction({ id: "2", amount: "500", type: "positive" }),
    ];

    const result = calculateSummary(transactions);

    expect(result.entriesTotal).toBe(1500);
    expect(result.expensesTotal).toBe(0);
    expect(result.balance).toBe(1500);
  });

  it("should sum expense transactions correctly", () => {
    const transactions = [
      makeTransaction({ amount: "300", type: "negative" }),
      makeTransaction({ id: "2", amount: "200", type: "negative" }),
    ];

    const result = calculateSummary(transactions);

    expect(result.entriesTotal).toBe(0);
    expect(result.expensesTotal).toBe(500);
    expect(result.balance).toBe(-500);
  });

  it("should calculate balance with mixed transactions", () => {
    const transactions = [
      makeTransaction({ amount: "3000", type: "positive" }),
      makeTransaction({ id: "2", amount: "1200", type: "negative" }),
      makeTransaction({ id: "3", amount: "500", type: "positive" }),
      makeTransaction({ id: "4", amount: "800", type: "negative" }),
    ];

    const result = calculateSummary(transactions);

    expect(result.entriesTotal).toBe(3500);
    expect(result.expensesTotal).toBe(2000);
    expect(result.balance).toBe(1500);
  });

  it("should find the last income date", () => {
    const transactions = [
      makeTransaction({
        type: "positive",
        date: "2025-01-10T10:00:00.000Z",
      }),
      makeTransaction({
        id: "2",
        type: "positive",
        date: "2025-03-20T10:00:00.000Z",
      }),
      makeTransaction({
        id: "3",
        type: "positive",
        date: "2025-02-15T10:00:00.000Z",
      }),
    ];

    const result = calculateSummary(transactions);

    expect(result.lastIncomeDate).toEqual(new Date("2025-03-20T10:00:00.000Z"));
  });

  it("should find the last expense date", () => {
    const transactions = [
      makeTransaction({
        type: "negative",
        date: "2025-06-01T10:00:00.000Z",
      }),
      makeTransaction({
        id: "2",
        type: "negative",
        date: "2025-08-15T10:00:00.000Z",
      }),
    ];

    const result = calculateSummary(transactions);

    expect(result.lastExpenseDate).toEqual(new Date("2025-08-15T10:00:00.000Z"));
  });

  it("should handle decimal amounts", () => {
    const transactions = [
      makeTransaction({ amount: "99.99", type: "positive" }),
      makeTransaction({ id: "2", amount: "49.50", type: "negative" }),
    ];

    const result = calculateSummary(transactions);

    expect(result.entriesTotal).toBeCloseTo(99.99);
    expect(result.expensesTotal).toBeCloseTo(49.5);
    expect(result.balance).toBeCloseTo(50.49);
  });
});

describe("formatLastTransactionDate", () => {
  it("should return fallback for null date", () => {
    expect(formatLastTransactionDate(null)).toBe("Não há transações");
  });

  it("should format a valid date", () => {
    const date = new Date("2025-03-15T10:00:00.000Z");
    const result = formatLastTransactionDate(date);
    expect(result).toContain("15");
  });
});
