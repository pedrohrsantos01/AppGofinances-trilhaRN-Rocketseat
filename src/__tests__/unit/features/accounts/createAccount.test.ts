import { createAccount } from "../../../../features/accounts/application/createAccount";
import { AppError } from "../../../../shared/domain/errors/AppError";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("createAccount", () => {
  it("should create an account with valid input", async () => {
    const account = await createAccount({
      name: "Nubank",
      type: "checking",
      userId: "user-1",
    });

    expect(account.id).toBeDefined();
    expect(account.name).toBe("Nubank");
    expect(account.type).toBe("checking");
    expect(account.balance_cents).toBe(0);
    expect(account.currency).toBe("BRL");
    expect(account.color).toBe("#5636D3");
    expect(account.icon).toBe("wallet");
    expect(account.is_active).toBe(true);
    expect(account.version).toBe(1);
    expect(account.user_id).toBe("user-1");
  });

  it("should use custom color and icon when provided", async () => {
    const account = await createAccount({
      name: "Poupanca",
      type: "savings",
      color: "#FF0000",
      icon: "piggy-bank",
      userId: "user-1",
    });

    expect(account.color).toBe("#FF0000");
    expect(account.icon).toBe("piggy-bank");
  });

  it("should trim whitespace from name", async () => {
    const account = await createAccount({
      name: "  Itau  ",
      type: "checking",
      userId: "user-1",
    });

    expect(account.name).toBe("Itau");
  });

  it("should throw VALIDATION_ERROR for empty name", async () => {
    await expect(createAccount({ name: "", type: "checking", userId: "user-1" })).rejects.toThrow(
      AppError
    );

    try {
      await createAccount({ name: "   ", type: "checking", userId: "user-1" });
    } catch (e) {
      expect((e as AppError).code).toBe("VALIDATION_ERROR");
    }
  });
});
