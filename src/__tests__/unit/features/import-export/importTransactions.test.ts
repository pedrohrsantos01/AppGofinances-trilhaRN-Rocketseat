import { processCSVImport } from "../../../../features/import-export/application/importTransactions";
import { ColumnMapping } from "../../../../features/import-export/domain/csvParser";

const defaultMapping: ColumnMapping = {
  date: "data",
  name: "descricao",
  amount: "valor",
  type: "tipo",
};

describe("processCSVImport", () => {
  it("should import valid CSV rows as transactions", () => {
    const csv = [
      "data,descricao,valor,tipo",
      "10/03/2026,Mercado,150.30,expense",
      "15/03/2026,Salario,5000.00,income",
    ].join("\n");

    const { transactions, result } = processCSVImport(
      csv,
      defaultMapping,
      "user-1",
      "acc-1",
      "food"
    );

    expect(result.imported).toBe(2);
    expect(result.duplicates).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(transactions).toHaveLength(2);
    expect(transactions[0].user_id).toBe("user-1");
    expect(transactions[0].account_id).toBe("acc-1");
    expect(transactions[0].category_id).toBe("food");
    expect(transactions[0].source).toBe("import");
  });

  it("should deduplicate identical rows", () => {
    const csv = [
      "data,descricao,valor,tipo",
      "10/03/2026,Mercado,150.30,expense",
      "10/03/2026,Mercado,150.30,expense",
    ].join("\n");

    const { result } = processCSVImport(csv, defaultMapping, "user-1", "acc-1", "food");

    expect(result.imported).toBe(1);
    expect(result.duplicates).toBe(1);
  });

  it("should collect errors for missing date", () => {
    const csv = [
      "data,descricao,valor,tipo",
      "10/03/2026,Mercado,150.30,expense",
      ",Sem data,100.00,expense",
    ].join("\n");

    const { result } = processCSVImport(csv, defaultMapping, "user-1", "acc-1", "food");

    expect(result.imported).toBe(1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].line).toBe(3);
  });

  it("should assign unique IDs to each transaction", () => {
    const csv = [
      "data,descricao,valor,tipo",
      "10/03/2026,Item A,100.00,expense",
      "11/03/2026,Item B,200.00,expense",
    ].join("\n");

    const { transactions } = processCSVImport(csv, defaultMapping, "user-1", "acc-1", "food");

    const ids = transactions.map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("should set version to 1 and status to confirmed", () => {
    const csv = ["data,descricao,valor,tipo", "10/03/2026,Compra,50.00,expense"].join("\n");

    const { transactions } = processCSVImport(csv, defaultMapping, "user-1", "acc-1", "purchases");

    expect(transactions[0].version).toBe(1);
    expect(transactions[0].status).toBe("confirmed");
  });
});
