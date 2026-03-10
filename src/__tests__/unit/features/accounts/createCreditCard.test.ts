import { createCreditCard } from "../../../../features/accounts/application/createCreditCard";
import { AppError } from "../../../../shared/domain/errors/AppError";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

const validInput = {
  name: "Nubank Mastercard",
  limit_cents: 500000,
  closing_day: 15,
  due_day: 22,
  account_id: "acc-1",
  userId: "user-1",
};

describe("createCreditCard", () => {
  it("should create a credit card with valid input", async () => {
    const card = await createCreditCard(validInput);

    expect(card.id).toBeDefined();
    expect(card.name).toBe("Nubank Mastercard");
    expect(card.limit_cents).toBe(500000);
    expect(card.closing_day).toBe(15);
    expect(card.due_day).toBe(22);
    expect(card.currency).toBe("BRL");
    expect(card.color).toBe("#FF872C");
    expect(card.is_active).toBe(true);
    expect(card.version).toBe(1);
  });

  it("should use custom color when provided", async () => {
    const card = await createCreditCard({ ...validInput, color: "#000" });
    expect(card.color).toBe("#000");
  });

  it("should throw for empty name", async () => {
    await expect(createCreditCard({ ...validInput, name: "" })).rejects.toThrow(AppError);
  });

  it("should throw for zero limit", async () => {
    await expect(createCreditCard({ ...validInput, limit_cents: 0 })).rejects.toThrow(AppError);
  });

  it("should throw for invalid closing day (0)", async () => {
    await expect(createCreditCard({ ...validInput, closing_day: 0 })).rejects.toThrow(AppError);
  });

  it("should throw for invalid closing day (32)", async () => {
    await expect(createCreditCard({ ...validInput, closing_day: 32 })).rejects.toThrow(AppError);
  });

  it("should throw for invalid due day (0)", async () => {
    await expect(createCreditCard({ ...validInput, due_day: 0 })).rejects.toThrow(AppError);
  });

  it("should throw for invalid due day (32)", async () => {
    await expect(createCreditCard({ ...validInput, due_day: 32 })).rejects.toThrow(AppError);
  });
});
