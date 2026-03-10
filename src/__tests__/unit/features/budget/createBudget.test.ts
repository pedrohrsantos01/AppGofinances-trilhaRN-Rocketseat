import { createBudget } from "../../../../features/budget/application/createBudget";
import { AppError } from "../../../../shared/domain/errors/AppError";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("createBudget", () => {
  it("should create a budget with valid input", async () => {
    const budget = await createBudget({
      category_id: "food",
      limit_cents: 100000,
      month: 3,
      year: 2026,
      rollover: false,
      user_id: "user-1",
    });

    expect(budget.id).toBeDefined();
    expect(budget.category_id).toBe("food");
    expect(budget.limit_cents).toBe(100000);
    expect(budget.spent_cents).toBe(0);
    expect(budget.month).toBe(3);
    expect(budget.year).toBe(2026);
    expect(budget.rollover).toBe(false);
    expect(budget.currency).toBe("BRL");
    expect(budget.version).toBe(1);
    expect(budget.user_id).toBe("user-1");
  });

  it("should throw VALIDATION_ERROR for empty category_id", async () => {
    await expect(
      createBudget({
        category_id: "",
        limit_cents: 100000,
        month: 3,
        year: 2026,
        rollover: false,
        user_id: "user-1",
      })
    ).rejects.toThrow(AppError);

    try {
      await createBudget({
        category_id: "",
        limit_cents: 100000,
        month: 3,
        year: 2026,
        rollover: false,
        user_id: "user-1",
      });
    } catch (e) {
      expect((e as AppError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("should throw VALIDATION_ERROR for zero limit", async () => {
    await expect(
      createBudget({
        category_id: "food",
        limit_cents: 0,
        month: 3,
        year: 2026,
        rollover: false,
        user_id: "user-1",
      })
    ).rejects.toThrow(AppError);
  });

  it("should throw VALIDATION_ERROR for negative limit", async () => {
    await expect(
      createBudget({
        category_id: "food",
        limit_cents: -5000,
        month: 3,
        year: 2026,
        rollover: false,
        user_id: "user-1",
      })
    ).rejects.toThrow(AppError);
  });
});
