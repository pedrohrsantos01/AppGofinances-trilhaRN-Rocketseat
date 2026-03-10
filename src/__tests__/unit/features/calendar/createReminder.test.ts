import { createReminder } from "../../../../features/calendar/application/createReminder";
import { AppError } from "../../../../shared/domain/errors/AppError";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("createReminder", () => {
  it("should create a reminder with valid input", async () => {
    const reminder = await createReminder({
      title: "Aluguel",
      due_date: "2026-04-05",
      amount_cents: 150000,
      user_id: "user-1",
    });

    expect(reminder.id).toBeDefined();
    expect(reminder.title).toBe("Aluguel");
    expect(reminder.due_date).toBe("2026-04-05");
    expect(reminder.amount_cents).toBe(150000);
    expect(reminder.is_completed).toBe(false);
    expect(reminder.notify_days_before).toBe(3);
    expect(reminder.user_id).toBe("user-1");
  });

  it("should trim whitespace from title", async () => {
    const reminder = await createReminder({
      title: "  Conta de luz  ",
      due_date: "2026-04-10",
      amount_cents: 20000,
      user_id: "user-1",
    });

    expect(reminder.title).toBe("Conta de luz");
  });

  it("should throw VALIDATION_ERROR for empty title", async () => {
    await expect(
      createReminder({
        title: "",
        due_date: "2026-04-05",
        amount_cents: 150000,
        user_id: "user-1",
      })
    ).rejects.toThrow(AppError);

    try {
      await createReminder({
        title: "   ",
        due_date: "2026-04-05",
        amount_cents: 150000,
        user_id: "user-1",
      });
    } catch (e) {
      expect((e as AppError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("should throw VALIDATION_ERROR for missing due_date", async () => {
    await expect(
      createReminder({
        title: "Internet",
        due_date: "",
        amount_cents: 10000,
        user_id: "user-1",
      })
    ).rejects.toThrow(AppError);
  });

  it("should accept custom notify_days_before", async () => {
    const reminder = await createReminder({
      title: "Cartao",
      due_date: "2026-04-15",
      amount_cents: 300000,
      notify_days_before: 7,
      user_id: "user-1",
    });

    expect(reminder.notify_days_before).toBe(7);
  });

  it("should accept recurrence option", async () => {
    const reminder = await createReminder({
      title: "Salario",
      due_date: "2026-04-01",
      amount_cents: 500000,
      recurrence: "monthly",
      user_id: "user-1",
    });

    expect(reminder.recurrence).toBe("monthly");
  });
});
