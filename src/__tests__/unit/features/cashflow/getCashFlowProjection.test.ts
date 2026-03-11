import { Transaction } from "../../../../shared/domain/entities/Transaction";
import { Account } from "../../../../shared/domain/entities/Account";

import { getCashFlowProjection } from "../../../../features/cashflow/application/getCashFlowProjection";

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
    date: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
    version: 1,
    user_id: "user1",
    ...overrides,
  };
}

const mockListTxByUser = jest.fn().mockResolvedValue([]);
const mockListAccByUser = jest.fn().mockResolvedValue([]);

jest.mock("../../../../features/transactions/infra/TransactionRepository", () => ({
  TransactionRepository: jest.fn(() => ({
    listByUser: (...args: any[]) => mockListTxByUser(...args),
  })),
}));

jest.mock("../../../../features/accounts/infra/AccountRepository", () => ({
  AccountRepository: jest.fn(() => ({
    listByUser: (...args: any[]) => mockListAccByUser(...args),
  })),
}));

describe("getCashFlowProjection", () => {
  beforeEach(() => {
    mockListTxByUser.mockClear();
    mockListAccByUser.mockClear();
  });

  it("should return projection with current balance from accounts", async () => {
    const accounts: Account[] = [
      {
        id: "acc-1",
        name: "Carteira",
        type: "cash",
        balance_cents: 100000,
        currency: "BRL",
        color: "#5636D3",
        icon: "dollar-sign",
        is_active: true,
        created_at: "",
        updated_at: "",
        version: 1,
        user_id: "user1",
      },
      {
        id: "acc-2",
        name: "Poupanca",
        type: "savings",
        balance_cents: 200000,
        currency: "BRL",
        color: "#12A454",
        icon: "trending-up",
        is_active: true,
        created_at: "",
        updated_at: "",
        version: 1,
        user_id: "user1",
      },
    ];
    mockListAccByUser.mockResolvedValue(accounts);
    mockListTxByUser.mockResolvedValue([]);

    const result = await getCashFlowProjection("user1");
    expect(result.current_balance_cents).toBe(300000);
    expect(result.periods).toHaveLength(3);
  });

  it("should include recurring projections", async () => {
    mockListAccByUser.mockResolvedValue([
      {
        id: "acc-1",
        name: "Carteira",
        type: "cash",
        balance_cents: 100000,
        currency: "BRL",
        color: "#5636D3",
        icon: "dollar-sign",
        is_active: true,
        created_at: "",
        updated_at: "",
        version: 1,
        user_id: "user1",
      },
    ]);
    mockListTxByUser.mockResolvedValue([
      makeTx({
        id: "1",
        recurring_rule_id: "rule-1",
        source: "recurring",
        date: "2026-01-10",
        amount_cents: 3990,
        name: "Netflix",
      }),
      makeTx({
        id: "2",
        recurring_rule_id: "rule-1",
        source: "recurring",
        date: "2026-02-10",
        amount_cents: 3990,
        name: "Netflix",
      }),
      makeTx({
        id: "3",
        recurring_rule_id: "rule-1",
        source: "recurring",
        date: "2026-03-10",
        amount_cents: 3990,
        name: "Netflix",
      }),
    ]);

    const result = await getCashFlowProjection("user1");
    // Should have projected items from recurring Netflix
    const allItems = result.periods.flatMap((p) => p.items);
    expect(allItems.length).toBeGreaterThan(0);
  });

  it("should include installment projections", async () => {
    mockListAccByUser.mockResolvedValue([
      {
        id: "acc-1",
        name: "Carteira",
        type: "cash",
        balance_cents: 100000,
        currency: "BRL",
        color: "#5636D3",
        icon: "dollar-sign",
        is_active: true,
        created_at: "",
        updated_at: "",
        version: 1,
        user_id: "user1",
      },
    ]);
    mockListTxByUser.mockResolvedValue([
      makeTx({
        id: "1",
        installment_group_id: "inst-1",
        installment_number: 1,
        installment_total: 6,
        date: "2026-03-10",
        amount_cents: 10000,
        name: "TV",
      }),
    ]);

    const result = await getCashFlowProjection("user1");
    const allItems = result.periods.flatMap((p) => p.items);
    const tvItems = allItems.filter((i) => i.name.includes("TV"));
    expect(tvItems.length).toBeGreaterThan(0);
  });

  it("should handle empty data gracefully", async () => {
    mockListAccByUser.mockResolvedValue([]);
    mockListTxByUser.mockResolvedValue([]);

    const result = await getCashFlowProjection("user1");
    expect(result.current_balance_cents).toBe(0);
    expect(result.periods).toHaveLength(3);
    expect(result.periods[0].projected_balance_cents).toBe(0);
  });

  it("should not project for cancelled or pending accounts", async () => {
    mockListAccByUser.mockResolvedValue([
      {
        id: "acc-1",
        name: "Inativa",
        type: "cash",
        balance_cents: 999999,
        currency: "BRL",
        color: "#ccc",
        icon: "x",
        is_active: false,
        created_at: "",
        updated_at: "",
        version: 1,
        user_id: "user1",
      },
    ]);
    mockListTxByUser.mockResolvedValue([]);

    const result = await getCashFlowProjection("user1");
    expect(result.current_balance_cents).toBe(0);
  });
});
