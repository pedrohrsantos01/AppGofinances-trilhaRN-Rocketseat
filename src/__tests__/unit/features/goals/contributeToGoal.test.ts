import { Goal } from "../../../../shared/domain/entities/Goal";

import { contributeToGoal } from "../../../../features/goals/application/contributeToGoal";

const mockGoal: Goal = {
  id: "goal-1",
  name: "Reserva",
  target_cents: 100000,
  current_cents: 0,
  currency: "BRL",
  status: "active",
  color: "#5636D3",
  icon: "flag",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
  user_id: "user1",
};

const mockGetById = jest.fn().mockResolvedValue(mockGoal);
const mockContribute = jest.fn().mockResolvedValue({ ...mockGoal, current_cents: 30000 });
const mockUpdate = jest.fn().mockResolvedValue({ ...mockGoal, status: "completed" });

jest.mock("../../../../features/goals/infra/GoalRepository", () => ({
  GoalRepository: jest.fn(() => ({
    getById: (...args: any[]) => mockGetById(...args),
    contribute: (...args: any[]) => mockContribute(...args),
    update: (...args: any[]) => mockUpdate(...args),
  })),
}));

describe("contributeToGoal", () => {
  beforeEach(() => {
    mockGetById.mockClear();
    mockContribute.mockClear();
    mockUpdate.mockClear();
  });

  it("should add contribution to goal", async () => {
    mockGetById.mockResolvedValue(mockGoal);
    mockContribute.mockResolvedValue({ ...mockGoal, current_cents: 30000 });

    const updated = await contributeToGoal("goal-1", 30000);
    expect(updated.current_cents).toBe(30000);
    expect(updated.status).toBe("active");
    expect(mockContribute).toHaveBeenCalledWith("goal-1", 30000);
  });

  it("should auto-complete goal when target is reached", async () => {
    mockGetById.mockResolvedValue(mockGoal);
    mockContribute.mockResolvedValue({ ...mockGoal, current_cents: 100000 });
    mockUpdate.mockResolvedValue({ ...mockGoal, current_cents: 100000, status: "completed" });

    const updated = await contributeToGoal("goal-1", 100000);
    expect(updated.status).toBe("completed");
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should throw on zero amount", async () => {
    await expect(contributeToGoal("any-id", 0)).rejects.toThrow("Valor deve ser maior que zero");
  });

  it("should throw on negative amount", async () => {
    await expect(contributeToGoal("any-id", -100)).rejects.toThrow("Valor deve ser maior que zero");
  });

  it("should throw when goal not found", async () => {
    mockGetById.mockResolvedValue(null);

    await expect(contributeToGoal("non-existent", 1000)).rejects.toThrow("Meta nao encontrada");
  });

  it("should throw when goal is not active", async () => {
    mockGetById.mockResolvedValue({ ...mockGoal, status: "completed" });

    await expect(contributeToGoal("goal-1", 1000)).rejects.toThrow(
      "Apenas metas ativas aceitam contribuicoes"
    );
  });
});
