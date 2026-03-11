import { Transaction } from "../../../../shared/domain/entities/Transaction";

import { generateInsights } from "../../../../features/insights/application/generateInsights";
import { Insight } from "../../../../shared/domain/entities/Insight";

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx-1",
    amount_cents: 5000,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "manual",
    name: "Test",
    category_id: "food",
    account_id: "acc-1",
    date: "2026-03-15T00:00:00.000Z",
    created_at: "2026-03-15T00:00:00.000Z",
    updated_at: "2026-03-15T00:00:00.000Z",
    version: 1,
    user_id: "user1",
    ...overrides,
  };
}

const mockListByUser = jest.fn().mockResolvedValue([]);

jest.mock("../../../../features/transactions/infra/TransactionRepository", () => ({
  TransactionRepository: jest.fn(() => ({
    listByUser: (...args: any[]) => mockListByUser(...args),
  })),
}));

describe("generateInsights", () => {
  beforeEach(() => {
    mockListByUser.mockClear();
  });

  it("should return empty when no transactions", async () => {
    mockListByUser.mockResolvedValue([]);

    const insights = await generateInsights("user1", 2, 2026); // month 2 = March (0-indexed)
    expect(insights).toHaveLength(0);
  });

  it("should detect recurring expenses across months", async () => {
    // The function calls listByUser without month filter to get all transactions
    mockListByUser.mockResolvedValue([
      makeTx({
        id: "1",
        date: "2025-12-10",
        amount_cents: 3990,
        name: "Netflix",
        category_id: "leisure",
      }),
      makeTx({
        id: "2",
        date: "2026-01-10",
        amount_cents: 3990,
        name: "Netflix",
        category_id: "leisure",
      }),
      makeTx({
        id: "3",
        date: "2026-02-10",
        amount_cents: 3990,
        name: "Netflix",
        category_id: "leisure",
      }),
      makeTx({
        id: "4",
        date: "2026-03-10",
        amount_cents: 3990,
        name: "Netflix",
        category_id: "leisure",
      }),
    ]);

    const insights = await generateInsights("user1", 2, 2026);
    const recurring = insights.filter((i: Insight) => i.type === "recurring_expense");
    expect(recurring.length).toBeGreaterThanOrEqual(1);
    expect(recurring[0].title).toContain("Netflix");
  });

  it("should detect spending anomalies in current month", async () => {
    mockListByUser.mockResolvedValue([
      // Previous months: ~R$100 food
      makeTx({
        id: "1",
        date: "2025-12-15",
        amount_cents: 10000,
        name: "Mercado",
        category_id: "food",
      }),
      makeTx({
        id: "2",
        date: "2026-01-15",
        amount_cents: 11000,
        name: "Mercado",
        category_id: "food",
      }),
      makeTx({
        id: "3",
        date: "2026-02-15",
        amount_cents: 10500,
        name: "Mercado",
        category_id: "food",
      }),
      // Current month: R$300 food (3x average)
      makeTx({
        id: "4",
        date: "2026-03-15",
        amount_cents: 30000,
        name: "Mercado",
        category_id: "food",
      }),
    ]);

    const insights = await generateInsights("user1", 2, 2026);
    const anomalies = insights.filter((i: Insight) => i.type === "spending_anomaly");
    expect(anomalies.length).toBeGreaterThanOrEqual(1);
    expect(anomalies[0].severity).toBe("warning");
  });

  it("should include category trend insights", async () => {
    mockListByUser.mockResolvedValue([
      makeTx({
        id: "1",
        date: "2026-02-10",
        amount_cents: 10000,
        name: "Mercado",
        category_id: "food",
      }),
      makeTx({
        id: "2",
        date: "2026-03-10",
        amount_cents: 15000,
        name: "Mercado",
        category_id: "food",
      }),
    ]);

    const insights = await generateInsights("user1", 2, 2026);
    const trends = insights.filter((i: Insight) => i.type === "category_trend");
    expect(trends.length).toBeGreaterThanOrEqual(1);
  });

  it("should not generate false positives for seasonal variation", async () => {
    // All months have similar spending - no anomaly
    mockListByUser.mockResolvedValue([
      makeTx({
        id: "1",
        date: "2025-12-15",
        amount_cents: 20000,
        name: "Mercado",
        category_id: "food",
      }),
      makeTx({
        id: "2",
        date: "2026-01-15",
        amount_cents: 21000,
        name: "Mercado",
        category_id: "food",
      }),
      makeTx({
        id: "3",
        date: "2026-02-15",
        amount_cents: 19500,
        name: "Mercado",
        category_id: "food",
      }),
      makeTx({
        id: "4",
        date: "2026-03-15",
        amount_cents: 22000,
        name: "Mercado",
        category_id: "food",
      }),
    ]);

    const insights = await generateInsights("user1", 2, 2026);
    const anomalies = insights.filter((i: Insight) => i.type === "spending_anomaly");
    expect(anomalies).toHaveLength(0);
  });
});
