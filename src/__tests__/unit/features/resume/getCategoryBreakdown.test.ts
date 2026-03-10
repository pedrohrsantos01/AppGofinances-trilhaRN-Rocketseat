import { getCategoryBreakdown } from "../../../../features/resume/application/getCategoryBreakdown";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("getCategoryBreakdown", () => {
  it("should return empty array when no transactions exist", async () => {
    const result = await getCategoryBreakdown("user-1", 3, 2026);
    expect(result).toEqual([]);
  });

  it("should calculate breakdown after adding expenses", async () => {
    const {
      createTransaction,
    } = require("../../../../features/transactions/application/createTransaction");

    await createTransaction({
      name: "Mercado",
      amount: 150,
      type: "negative",
      categoryKey: "food",
      userId: "user-1",
    });

    await createTransaction({
      name: "Cinema",
      amount: 50,
      type: "negative",
      categoryKey: "leisure",
      userId: "user-1",
    });

    const now = new Date();
    const result = await getCategoryBreakdown("user-1", now.getMonth(), now.getFullYear());

    expect(result.length).toBeGreaterThanOrEqual(1);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("key");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("total");
      expect(result[0]).toHaveProperty("totalFormatted");
      expect(result[0]).toHaveProperty("percent");
      expect(result[0]).toHaveProperty("color");
    }
  });
});
