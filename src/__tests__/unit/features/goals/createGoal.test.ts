import { createGoal } from "../../../../features/goals/application/createGoal";
import { closeDatabase } from "../../../../shared/infra/database/database";
import sqlite from "expo-sqlite";

beforeEach(() => {
  (sqlite as any).__resetStores();
  closeDatabase();
});

describe("createGoal", () => {
  it("should create a goal with valid input", async () => {
    const goal = await createGoal({
      name: "Viagem Europa",
      target_cents: 1500000,
      target_date: "2027-06-01",
      user_id: "user1",
    });

    expect(goal.id).toBeDefined();
    expect(goal.name).toBe("Viagem Europa");
    expect(goal.target_cents).toBe(1500000);
    expect(goal.current_cents).toBe(0);
    expect(goal.status).toBe("active");
    expect(goal.target_date).toBe("2027-06-01");
    expect(goal.color).toBe("#5636D3");
    expect(goal.icon).toBe("flag");
  });

  it("should throw on empty name", async () => {
    await expect(
      createGoal({ name: "  ", target_cents: 100000, user_id: "user1" })
    ).rejects.toThrow("Nome da meta e obrigatorio");
  });

  it("should throw on zero target", async () => {
    await expect(createGoal({ name: "Meta", target_cents: 0, user_id: "user1" })).rejects.toThrow(
      "Valor da meta deve ser maior que zero"
    );
  });

  it("should throw on negative target", async () => {
    await expect(
      createGoal({ name: "Meta", target_cents: -100, user_id: "user1" })
    ).rejects.toThrow("Valor da meta deve ser maior que zero");
  });

  it("should use custom color and icon", async () => {
    const goal = await createGoal({
      name: "Carro",
      target_cents: 5000000,
      color: "#FF0000",
      icon: "car",
      user_id: "user1",
    });

    expect(goal.color).toBe("#FF0000");
    expect(goal.icon).toBe("car");
  });
});
