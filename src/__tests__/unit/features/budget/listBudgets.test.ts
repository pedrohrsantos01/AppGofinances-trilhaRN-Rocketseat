import { listBudgets } from "../../../../features/budget/application/listBudgets";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("listBudgets", () => {
  it("should return empty array when no budgets exist", async () => {
    const budgets = await listBudgets("user-1", 3, 2026);
    expect(budgets).toEqual([]);
  });

  it("should return budgets with consumption and alert", async () => {
    const { createBudget } = require("../../../../features/budget/application/createBudget");
    await createBudget({
      category_id: "food",
      limit_cents: 100000,
      month: 3,
      year: 2026,
      rollover: false,
      user_id: "user-1",
    });

    const budgets = await listBudgets("user-1", 3, 2026);
    expect(budgets).toHaveLength(1);
    expect(budgets[0].consumption).toBeDefined();
    expect(budgets[0].consumption.percent).toBe(0);
    expect(budgets[0].alert).toBeNull();
  });
});
