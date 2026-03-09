import {
  validateTransactionEdit,
  computeBalanceImpact,
} from "../../../../features/transactions/domain/editDeleteRules";
import { Transaction } from "../../../../shared/domain/entities/Transaction";

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
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

describe("validateTransactionEdit", () => {
  it("should pass for valid edit", () => {
    const result = validateTransactionEdit({
      name: "Updated",
      amount_cents: 5000,
      type: "expense",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject empty name", () => {
    const result = validateTransactionEdit({ name: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nome é obrigatório");
  });

  it("should reject zero amount", () => {
    const result = validateTransactionEdit({ amount_cents: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Valor deve ser maior que zero");
  });

  it("should reject negative amount", () => {
    const result = validateTransactionEdit({ amount_cents: -100 });
    expect(result.valid).toBe(false);
  });

  it("should allow partial edits", () => {
    const result = validateTransactionEdit({ name: "Just name" });
    expect(result.valid).toBe(true);
  });
});

describe("computeBalanceImpact", () => {
  it("should return positive impact for deleted income", () => {
    const tx = makeTx({ type: "income", amount_cents: 50000 });
    const impact = computeBalanceImpact("delete", tx);
    expect(impact).toBe(-50000); // removing income decreases balance
  });

  it("should return negative impact for deleted expense", () => {
    const tx = makeTx({ type: "expense", amount_cents: 30000 });
    const impact = computeBalanceImpact("delete", tx);
    expect(impact).toBe(30000); // removing expense increases balance
  });

  it("should compute edit impact as difference", () => {
    const oldTx = makeTx({ type: "income", amount_cents: 50000 });
    const newTx = makeTx({ type: "income", amount_cents: 80000 });
    const impact = computeBalanceImpact("edit", oldTx, newTx);
    expect(impact).toBe(30000); // increased income by 300
  });

  it("should handle type change from income to expense", () => {
    const oldTx = makeTx({ type: "income", amount_cents: 10000 });
    const newTx = makeTx({ type: "expense", amount_cents: 10000 });
    const impact = computeBalanceImpact("edit", oldTx, newTx);
    expect(impact).toBe(-20000); // lost 100 income + added 100 expense
  });

  it("should return zero impact for no change", () => {
    const tx = makeTx({ type: "income", amount_cents: 50000 });
    const impact = computeBalanceImpact("edit", tx, tx);
    expect(impact).toBe(0);
  });
});
