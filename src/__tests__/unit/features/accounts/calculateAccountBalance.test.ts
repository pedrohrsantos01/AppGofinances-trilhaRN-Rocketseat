import { calculateAccountBalance } from "../../../../features/accounts/domain/calculateAccountBalance";
import { Transaction } from "../../../../shared/domain/entities/Transaction";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t1",
    amount_cents: 10000,
    currency: "BRL",
    type: "income",
    status: "confirmed",
    source: "manual",
    name: "Test",
    category_id: "salary",
    account_id: "acc-1",
    date: "2025-03-01T10:00:00.000Z",
    created_at: "2025-03-01T10:00:00.000Z",
    updated_at: "2025-03-01T10:00:00.000Z",
    version: 1,
    user_id: "user-1",
    ...overrides,
  };
}

describe("calculateAccountBalance", () => {
  it("should return zero for empty transactions", () => {
    const result = calculateAccountBalance([]);
    expect(result.balance_cents).toBe(0);
    expect(result.income_cents).toBe(0);
    expect(result.expense_cents).toBe(0);
    expect(result.transaction_count).toBe(0);
  });

  it("should sum income transactions", () => {
    const transactions = [
      makeTransaction({ amount_cents: 500000 }),
      makeTransaction({ id: "t2", amount_cents: 150000 }),
    ];

    const result = calculateAccountBalance(transactions);
    expect(result.income_cents).toBe(650000);
    expect(result.expense_cents).toBe(0);
    expect(result.balance_cents).toBe(650000);
    expect(result.transaction_count).toBe(2);
  });

  it("should subtract expense transactions", () => {
    const transactions = [
      makeTransaction({ type: "expense", amount_cents: 35050 }),
      makeTransaction({ id: "t2", type: "expense", amount_cents: 12000 }),
    ];

    const result = calculateAccountBalance(transactions);
    expect(result.income_cents).toBe(0);
    expect(result.expense_cents).toBe(47050);
    expect(result.balance_cents).toBe(-47050);
  });

  it("should calculate correct balance with mixed types", () => {
    const transactions = [
      makeTransaction({ amount_cents: 500000, type: "income" }),
      makeTransaction({ id: "t2", amount_cents: 120000, type: "expense" }),
      makeTransaction({ id: "t3", amount_cents: 80000, type: "income" }),
      makeTransaction({ id: "t4", amount_cents: 45000, type: "expense" }),
    ];

    const result = calculateAccountBalance(transactions);
    expect(result.income_cents).toBe(580000);
    expect(result.expense_cents).toBe(165000);
    expect(result.balance_cents).toBe(415000);
    expect(result.transaction_count).toBe(4);
  });

  it("should ignore cancelled transactions", () => {
    const transactions = [
      makeTransaction({ amount_cents: 500000, type: "income" }),
      makeTransaction({
        id: "t2",
        amount_cents: 100000,
        type: "expense",
        status: "cancelled",
      }),
    ];

    const result = calculateAccountBalance(transactions);
    expect(result.balance_cents).toBe(500000);
    expect(result.expense_cents).toBe(0);
  });

  it("should include pending transactions", () => {
    const transactions = [
      makeTransaction({
        amount_cents: 300000,
        type: "income",
        status: "pending",
      }),
    ];

    const result = calculateAccountBalance(transactions);
    expect(result.balance_cents).toBe(300000);
  });

  it("should filter by account_id when provided", () => {
    const transactions = [
      makeTransaction({ amount_cents: 500000, account_id: "acc-1" }),
      makeTransaction({
        id: "t2",
        amount_cents: 200000,
        account_id: "acc-2",
      }),
    ];

    const result = calculateAccountBalance(transactions, "acc-1");
    expect(result.balance_cents).toBe(500000);
    expect(result.transaction_count).toBe(1);
  });

  it("should handle transfer type as expense for source account", () => {
    const transactions = [
      makeTransaction({
        amount_cents: 50000,
        type: "transfer",
        account_id: "acc-1",
      }),
    ];

    const result = calculateAccountBalance(transactions, "acc-1");
    expect(result.balance_cents).toBe(-50000);
  });
});
