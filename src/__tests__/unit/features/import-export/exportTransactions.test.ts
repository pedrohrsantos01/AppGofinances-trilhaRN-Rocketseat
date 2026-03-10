import { exportToCSV } from "../../../../features/import-export/application/exportTransactions";
import { Transaction } from "../../../../shared/domain/entities/Transaction";

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx-1",
    amount_cents: 10000,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "manual",
    name: "Test",
    category_id: "food",
    account_id: "acc-1",
    date: "2026-03-10",
    created_at: "2026-03-10T00:00:00.000Z",
    updated_at: "2026-03-10T00:00:00.000Z",
    version: 1,
    user_id: "user-1",
    ...overrides,
  };
}

describe("exportToCSV", () => {
  it("should return header-only for empty array", () => {
    const csv = exportToCSV([]);
    expect(csv).toBe("data,descricao,valor,tipo,categoria,conta");
  });

  it("should export transactions as CSV", () => {
    const csv = exportToCSV([makeTx(), makeTx({ id: "tx-2", name: "Another" })]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("data");
    expect(lines[1]).toContain("Test");
    expect(lines[2]).toContain("Another");
  });
});
