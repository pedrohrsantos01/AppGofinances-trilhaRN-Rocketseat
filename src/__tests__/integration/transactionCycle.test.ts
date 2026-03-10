import { createTransaction } from "../../features/transactions/application/createTransaction";
import { getTransactionSummary } from "../../features/transactions/application/getTransactionSummary";
import { closeDatabase } from "../../shared/infra/database/database";

// Reset in-memory SQLite stores between tests
beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

const TEST_USER_ID = "test-user-123";

describe("Transaction Cycle: create → getSummary", () => {
  it("should reflect a new income transaction in summary", async () => {
    await createTransaction({
      name: "Salário",
      amount: 5000,
      type: "positive",
      categoryKey: "salary",
      userId: TEST_USER_ID,
    });

    const { transactions } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(1);
    expect(transactions[0].name).toBe("Salário");
    expect(transactions[0].type).toBe("positive");
  });

  it("should reflect a new expense transaction in summary", async () => {
    await createTransaction({
      name: "Almoço",
      amount: 45.5,
      type: "negative",
      categoryKey: "food",
      userId: TEST_USER_ID,
    });

    const { transactions } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe("negative");
  });

  it("should calculate correct balance with multiple transactions", async () => {
    await createTransaction({
      name: "Salário",
      amount: 3000,
      type: "positive",
      categoryKey: "salary",
      userId: TEST_USER_ID,
    });

    await createTransaction({
      name: "Aluguel",
      amount: 1200,
      type: "negative",
      categoryKey: "purchases",
      userId: TEST_USER_ID,
    });

    await createTransaction({
      name: "Freelance",
      amount: 800,
      type: "positive",
      categoryKey: "salary",
      userId: TEST_USER_ID,
    });

    const { transactions } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(3);
  });

  it("should return empty state when no transactions exist", async () => {
    const { transactions, highlightData } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(0);
    expect(highlightData.entries.lastTransaction).toBe("Não há transações");
    expect(highlightData.expensives.lastTransaction).toBe("Não há transações");
    expect(highlightData.total.lastTransaction).toBe("Não há transações");
  });

  it("should store transaction with generated id", async () => {
    const result = await createTransaction({
      name: "Test",
      amount: 100,
      type: "positive",
      categoryKey: "salary",
      userId: TEST_USER_ID,
    });

    expect(result.id).toBeDefined();
    expect(result.id.length).toBeGreaterThan(0);
    expect(result.amount_cents).toBe(10000);
    expect(result.category_id).toBe("salary");
  });

  it("should isolate transactions between users", async () => {
    await createTransaction({
      name: "User1 Transaction",
      amount: 1000,
      type: "positive",
      categoryKey: "salary",
      userId: "user-1",
    });

    await createTransaction({
      name: "User2 Transaction",
      amount: 500,
      type: "positive",
      categoryKey: "salary",
      userId: "user-2",
    });

    const user1Summary = await getTransactionSummary("user-1");
    const user2Summary = await getTransactionSummary("user-2");

    expect(user1Summary.transactions).toHaveLength(1);
    expect(user2Summary.transactions).toHaveLength(1);
  });
});
