import {
  amountStringToCents,
  migrateTransactionV1ToV2,
  migrateAllTransactionsV1ToV2,
  V1Transaction,
} from "../../../shared/infra/storage/migrations/v1_to_v2";

describe("amountStringToCents", () => {
  it("should convert '150.99' to 15099", () => {
    expect(amountStringToCents("150.99")).toBe(15099);
  });

  it("should convert '0.1' to 10", () => {
    expect(amountStringToCents("0.1")).toBe(10);
  });

  it("should convert '0.2' to 20", () => {
    expect(amountStringToCents("0.2")).toBe(20);
  });

  it("should convert '19.99' to 1999", () => {
    expect(amountStringToCents("19.99")).toBe(1999);
  });

  it("should convert '0' to 0", () => {
    expect(amountStringToCents("0")).toBe(0);
  });

  it("should convert '1000' to 100000", () => {
    expect(amountStringToCents("1000")).toBe(100000);
  });

  it("should return 0 for invalid string", () => {
    expect(amountStringToCents("abc")).toBe(0);
  });

  it("should handle '0.01' correctly (1 cent)", () => {
    expect(amountStringToCents("0.01")).toBe(1);
  });

  it("should handle floating point edge case '33.33'", () => {
    expect(amountStringToCents("33.33")).toBe(3333);
  });
});

describe("migrateTransactionV1ToV2", () => {
  const v1Transaction: V1Transaction = {
    id: "abc-123",
    name: "Salário",
    amount: "5000",
    type: "positive",
    category: "salary",
    date: "2025-01-15T10:00:00.000Z",
  };

  it("should convert positive type to income", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.type).toBe("income");
  });

  it("should convert negative type to expense", () => {
    const v1 = { ...v1Transaction, type: "negative" as const };
    const result = migrateTransactionV1ToV2(v1, "user1", "acc1");
    expect(result.type).toBe("expense");
  });

  it("should convert amount string to cents", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.amount_cents).toBe(500000);
  });

  it("should preserve original amount string", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.amount).toBe("5000");
  });

  it("should set default fields", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.currency).toBe("BRL");
    expect(result.status).toBe("confirmed");
    expect(result.source).toBe("manual");
    expect(result.version).toBe(1);
  });

  it("should set user_id and account_id", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.user_id).toBe("user1");
    expect(result.account_id).toBe("acc1");
  });

  it("should preserve id, name, category, date", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.id).toBe("abc-123");
    expect(result.name).toBe("Salário");
    expect(result.category).toBe("salary");
    expect(result.category_id).toBe("salary");
    expect(result.date).toBe("2025-01-15T10:00:00.000Z");
  });

  it("should preserve legacy_type", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.legacy_type).toBe("positive");
  });

  it("should set created_at and updated_at", () => {
    const result = migrateTransactionV1ToV2(v1Transaction, "user1", "acc1");
    expect(result.created_at).toBe("2025-01-15T10:00:00.000Z");
    expect(result.updated_at).toBeDefined();
  });
});

describe("migrateAllTransactionsV1ToV2", () => {
  it("should migrate all transactions in array", () => {
    const v1Transactions: V1Transaction[] = [
      {
        id: "1",
        name: "Salary",
        amount: "5000",
        type: "positive",
        category: "salary",
        date: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        name: "Groceries",
        amount: "350.50",
        type: "negative",
        category: "food",
        date: "2025-01-05T00:00:00.000Z",
      },
    ];

    const result = migrateAllTransactionsV1ToV2(v1Transactions, "user1", "acc1");

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("income");
    expect(result[0].amount_cents).toBe(500000);
    expect(result[1].type).toBe("expense");
    expect(result[1].amount_cents).toBe(35050);
  });

  it("should return empty array for empty input", () => {
    const result = migrateAllTransactionsV1ToV2([], "user1", "acc1");
    expect(result).toEqual([]);
  });
});
