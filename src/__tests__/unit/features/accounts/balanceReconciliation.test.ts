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

describe("Balance reconciliation after edit/delete", () => {
  it("should recompute correctly after removing a transaction", () => {
    const original = [
      makeTransaction({ id: "t1", amount_cents: 500000, type: "income" }),
      makeTransaction({ id: "t2", amount_cents: 120000, type: "expense" }),
      makeTransaction({ id: "t3", amount_cents: 80000, type: "expense" }),
    ];

    const beforeDelete = calculateAccountBalance(original);
    expect(beforeDelete.balance_cents).toBe(300000); // 5000 - 1200 - 800

    // Simulate deleting t2
    const afterDelete = original.filter((t) => t.id !== "t2");
    const result = calculateAccountBalance(afterDelete);
    expect(result.balance_cents).toBe(420000); // 5000 - 800
    expect(result.transaction_count).toBe(2);
  });

  it("should recompute correctly after editing a transaction amount", () => {
    const transactions = [
      makeTransaction({ id: "t1", amount_cents: 500000, type: "income" }),
      makeTransaction({ id: "t2", amount_cents: 120000, type: "expense" }),
    ];

    const before = calculateAccountBalance(transactions);
    expect(before.balance_cents).toBe(380000);

    // Edit t2 amount from 1200 to 1500
    const edited = transactions.map((t) => (t.id === "t2" ? { ...t, amount_cents: 150000 } : t));

    const after = calculateAccountBalance(edited);
    expect(after.balance_cents).toBe(350000); // 5000 - 1500
  });

  it("should recompute correctly after changing transaction type", () => {
    const transactions = [
      makeTransaction({ id: "t1", amount_cents: 100000, type: "income" }),
      makeTransaction({ id: "t2", amount_cents: 50000, type: "expense" }),
    ];

    const before = calculateAccountBalance(transactions);
    expect(before.balance_cents).toBe(50000);

    // Change t2 from expense to income
    const edited = transactions.map((t) => (t.id === "t2" ? { ...t, type: "income" as const } : t));

    const after = calculateAccountBalance(edited);
    expect(after.balance_cents).toBe(150000); // 1000 + 500
  });

  it("should handle cancelling a transaction", () => {
    const transactions = [
      makeTransaction({ id: "t1", amount_cents: 500000, type: "income" }),
      makeTransaction({ id: "t2", amount_cents: 200000, type: "expense" }),
    ];

    const before = calculateAccountBalance(transactions);
    expect(before.balance_cents).toBe(300000);

    // Cancel t2 instead of deleting
    const cancelled = transactions.map((t) =>
      t.id === "t2" ? { ...t, status: "cancelled" as const } : t
    );

    const after = calculateAccountBalance(cancelled);
    expect(after.balance_cents).toBe(500000); // Only income remains
    expect(after.transaction_count).toBe(1);
  });

  it("should produce consistent balance regardless of transaction order", () => {
    const transactions = [
      makeTransaction({ id: "t1", amount_cents: 100000, type: "income" }),
      makeTransaction({ id: "t2", amount_cents: 30000, type: "expense" }),
      makeTransaction({ id: "t3", amount_cents: 50000, type: "income" }),
      makeTransaction({ id: "t4", amount_cents: 20000, type: "expense" }),
    ];

    const forward = calculateAccountBalance(transactions);
    const reversed = calculateAccountBalance([...transactions].reverse());
    const shuffled = calculateAccountBalance([
      transactions[2],
      transactions[0],
      transactions[3],
      transactions[1],
    ]);

    expect(forward.balance_cents).toBe(reversed.balance_cents);
    expect(forward.balance_cents).toBe(shuffled.balance_cents);
    expect(forward.balance_cents).toBe(100000); // 1000 + 500 - 300 - 200
  });
});
