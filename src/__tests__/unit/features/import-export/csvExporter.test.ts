import { transactionsToCSV } from "../../../../features/import-export/domain/csvExporter";
import { Transaction } from "../../../../shared/domain/entities/Transaction";

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx-1",
    amount_cents: 15099,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "manual",
    name: "Mercado",
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

describe("transactionsToCSV", () => {
  it("should generate header row", () => {
    const csv = transactionsToCSV([]);
    expect(csv).toBe("data,descricao,valor,tipo,categoria,conta");
  });

  it("should generate a single transaction line", () => {
    const csv = transactionsToCSV([makeTx()]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("2026-03-10");
    expect(lines[1]).toContain("Mercado");
    expect(lines[1]).toContain("expense");
    expect(lines[1]).toContain("food");
    expect(lines[1]).toContain("acc-1");
  });

  it("should escape names containing commas", () => {
    const csv = transactionsToCSV([makeTx({ name: "Pão, leite e ovos" })]);
    const lines = csv.split("\n");
    expect(lines[1]).toContain('"Pão, leite e ovos"');
  });

  it("should handle multiple transactions", () => {
    const txs = [
      makeTx({ id: "1", name: "Salario", type: "income", amount_cents: 500000 }),
      makeTx({ id: "2", name: "Aluguel", type: "expense", amount_cents: 150000 }),
      makeTx({ id: "3", name: "Mercado", type: "expense", amount_cents: 35000 }),
    ];
    const csv = transactionsToCSV(txs);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(4);
  });

  it("should format amount using Money value object", () => {
    const csv = transactionsToCSV([makeTx({ amount_cents: 9990 })]);
    const lines = csv.split("\n");
    // R$ 99,90 in pt-BR format
    expect(lines[1]).toContain("99,90");
  });
});
