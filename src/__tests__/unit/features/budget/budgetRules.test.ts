import {
  calculateBudgetConsumption,
  checkBudgetAlert,
  applyRollover,
} from "../../../../features/budget/domain/budgetRules";

describe("calculateBudgetConsumption", () => {
  it("should return zero consumption when no spending", () => {
    const result = calculateBudgetConsumption(100000, 0);
    expect(result.spent_cents).toBe(0);
    expect(result.remaining_cents).toBe(100000);
    expect(result.percent).toBe(0);
  });

  it("should calculate correct percentage", () => {
    const result = calculateBudgetConsumption(100000, 50000);
    expect(result.percent).toBe(50);
    expect(result.remaining_cents).toBe(50000);
  });

  it("should handle 100% consumption", () => {
    const result = calculateBudgetConsumption(100000, 100000);
    expect(result.percent).toBe(100);
    expect(result.remaining_cents).toBe(0);
  });

  it("should handle over-budget (>100%)", () => {
    const result = calculateBudgetConsumption(100000, 150000);
    expect(result.percent).toBe(150);
    expect(result.remaining_cents).toBe(-50000);
  });

  it("should handle zero limit", () => {
    const result = calculateBudgetConsumption(0, 0);
    expect(result.percent).toBe(0);
    expect(result.remaining_cents).toBe(0);
  });
});

describe("checkBudgetAlert", () => {
  it("should return null when under 80%", () => {
    const alert = checkBudgetAlert(100000, 70000);
    expect(alert).toBeNull();
  });

  it("should return 'warning' at 80%", () => {
    const alert = checkBudgetAlert(100000, 80000);
    expect(alert).toBe("warning");
  });

  it("should return 'warning' between 80-99%", () => {
    const alert = checkBudgetAlert(100000, 90000);
    expect(alert).toBe("warning");
  });

  it("should return 'critical' at 100%", () => {
    const alert = checkBudgetAlert(100000, 100000);
    expect(alert).toBe("critical");
  });

  it("should return 'critical' when over budget", () => {
    const alert = checkBudgetAlert(100000, 120000);
    expect(alert).toBe("critical");
  });

  it("should return null for zero limit", () => {
    const alert = checkBudgetAlert(0, 0);
    expect(alert).toBeNull();
  });
});

describe("applyRollover", () => {
  it("should add remaining from previous month", () => {
    const result = applyRollover({
      current_limit_cents: 100000,
      previous_limit_cents: 100000,
      previous_spent_cents: 70000,
    });

    // 30000 remaining from previous + 100000 current = 130000
    expect(result).toBe(130000);
  });

  it("should subtract overspend from previous month", () => {
    const result = applyRollover({
      current_limit_cents: 100000,
      previous_limit_cents: 100000,
      previous_spent_cents: 120000,
    });

    // -20000 overspent + 100000 current = 80000
    expect(result).toBe(80000);
  });

  it("should handle exact spending in previous month", () => {
    const result = applyRollover({
      current_limit_cents: 100000,
      previous_limit_cents: 100000,
      previous_spent_cents: 100000,
    });

    expect(result).toBe(100000);
  });

  it("should not go below zero", () => {
    const result = applyRollover({
      current_limit_cents: 50000,
      previous_limit_cents: 50000,
      previous_spent_cents: 200000,
    });

    // -150000 + 50000 would be negative, clamp to 0
    expect(result).toBe(0);
  });
});
