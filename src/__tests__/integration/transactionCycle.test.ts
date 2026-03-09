import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTransaction } from "../../features/transactions/application/createTransaction";
import { getTransactionSummary } from "../../features/transactions/application/getTransactionSummary";

const TEST_USER_ID = "test-user-123";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("Transaction Cycle: create → getSummary", () => {
  it("should reflect a new income transaction in summary", async () => {
    await createTransaction({
      name: "Salário",
      amount: 5000,
      type: "positive",
      categoryKey: "salary",
      userId: TEST_USER_ID,
    });

    const { transactions, highlightData } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(1);
    expect(transactions[0].name).toBe("Salário");
    expect(highlightData.entries.amount).toContain("5.000,00");
    expect(highlightData.expensives.amount).toContain("0,00");
    expect(highlightData.total.amount).toContain("5.000,00");
  });

  it("should reflect a new expense transaction in summary", async () => {
    await createTransaction({
      name: "Almoço",
      amount: 45.5,
      type: "negative",
      categoryKey: "food",
      userId: TEST_USER_ID,
    });

    const { highlightData } = await getTransactionSummary(TEST_USER_ID);

    expect(highlightData.entries.amount).toContain("0,00");
    expect(highlightData.expensives.amount).toContain("45,50");
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

    const { transactions, highlightData } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(3);
    expect(highlightData.entries.amount).toContain("3.800,00");
    expect(highlightData.expensives.amount).toContain("1.200,00");
    expect(highlightData.total.amount).toContain("2.600,00");
  });

  it("should return empty state when no transactions exist", async () => {
    const { transactions, highlightData } = await getTransactionSummary(TEST_USER_ID);

    expect(transactions).toHaveLength(0);
    expect(highlightData.entries.lastTransaction).toBe("Não há transações");
    expect(highlightData.expensives.lastTransaction).toBe("Não há transações");
    expect(highlightData.total.lastTransaction).toBe("Não há transações");
  });

  it("should store transaction with generated id and date", async () => {
    const result = await createTransaction({
      name: "Test",
      amount: 100,
      type: "positive",
      categoryKey: "salary",
      userId: TEST_USER_ID,
    });

    expect(result.id).toBeDefined();
    expect(result.id.length).toBeGreaterThan(0);
    expect(result.date).toBeDefined();
    expect(result.amount).toBe("100");
    expect(result.category).toBe("salary");
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
    expect(user1Summary.highlightData.entries.amount).toContain("1.000,00");
    expect(user2Summary.highlightData.entries.amount).toContain("500,00");
  });
});
