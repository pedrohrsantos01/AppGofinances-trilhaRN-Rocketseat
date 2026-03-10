import { listAccounts } from "../../../../features/accounts/application/listAccounts";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("listAccounts", () => {
  it("should return empty array when no accounts exist", async () => {
    const accounts = await listAccounts("user-1");
    expect(accounts).toEqual([]);
  });

  it("should return accounts after creation", async () => {
    const { createAccount } = require("../../../../features/accounts/application/createAccount");
    await createAccount({ name: "Nubank", type: "checking", userId: "user-1" });
    await createAccount({ name: "Poupanca", type: "savings", userId: "user-1" });

    const accounts = await listAccounts("user-1");
    expect(accounts).toHaveLength(2);
  });
});
