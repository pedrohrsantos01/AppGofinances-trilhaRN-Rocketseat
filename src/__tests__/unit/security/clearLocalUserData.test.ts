import { createTransaction } from "../../../features/transactions/application/createTransaction";
import { TransactionRepository } from "../../../features/transactions/infra/TransactionRepository";
import { clearLocalUserData } from "../../../shared/infra/security/clearLocalUserData";
import { closeDatabase } from "../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("clearLocalUserData", () => {
  it("removes local finance data for the signed out user only", async () => {
    const repo = new TransactionRepository();

    await createTransaction({
      name: "User 1 income",
      amount: 100,
      type: "positive",
      categoryKey: "salary",
      userId: "user-1",
    });
    await createTransaction({
      name: "User 2 income",
      amount: 200,
      type: "positive",
      categoryKey: "salary",
      userId: "user-2",
    });

    await clearLocalUserData("user-1");

    expect(await repo.listByUser("user-1")).toEqual([]);
    expect(await repo.listByUser("user-2")).toHaveLength(1);
  });
});
