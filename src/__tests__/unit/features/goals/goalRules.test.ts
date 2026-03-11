import {
  goalProgress,
  goalRemaining,
  monthlyProjection,
  isGoalDelayed,
  daysUntilTarget,
} from "../../../../features/goals/domain/goalRules";

describe("goalRules", () => {
  describe("goalProgress", () => {
    it("should return 0 when no contribution", () => {
      expect(goalProgress(0, 100000)).toBe(0);
    });

    it("should return 50 when half contributed", () => {
      expect(goalProgress(50000, 100000)).toBe(50);
    });

    it("should return 100 when fully contributed", () => {
      expect(goalProgress(100000, 100000)).toBe(100);
    });

    it("should cap at 100 even when over-contributed", () => {
      expect(goalProgress(120000, 100000)).toBe(100);
    });

    it("should return 0 when target is 0", () => {
      expect(goalProgress(5000, 0)).toBe(0);
    });
  });

  describe("goalRemaining", () => {
    it("should return remaining cents", () => {
      expect(goalRemaining(30000, 100000)).toBe(70000);
    });

    it("should return 0 when goal is met", () => {
      expect(goalRemaining(100000, 100000)).toBe(0);
    });

    it("should return 0 when over-contributed", () => {
      expect(goalRemaining(120000, 100000)).toBe(0);
    });
  });

  describe("monthlyProjection", () => {
    it("should calculate required monthly amount", () => {
      // 100000 cents remaining, 5 months left
      const result = monthlyProjection(0, 100000, 5);
      expect(result).toBe(20000); // 100000 / 5
    });

    it("should account for current progress", () => {
      // 60000 remaining, 3 months
      const result = monthlyProjection(40000, 100000, 3);
      expect(result).toBe(20000); // 60000 / 3
    });

    it("should return 0 when goal is already met", () => {
      const result = monthlyProjection(100000, 100000, 3);
      expect(result).toBe(0);
    });

    it("should return remaining amount when 1 month left", () => {
      const result = monthlyProjection(80000, 100000, 1);
      expect(result).toBe(20000);
    });

    it("should return remaining amount when 0 months left", () => {
      const result = monthlyProjection(80000, 100000, 0);
      expect(result).toBe(20000);
    });
  });

  describe("isGoalDelayed", () => {
    it("should return false when no target date", () => {
      expect(isGoalDelayed(50000, 100000, undefined)).toBe(false);
    });

    it("should return false when target date is in the future and on track", () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      expect(isGoalDelayed(50000, 100000, futureDate.toISOString())).toBe(false);
    });

    it("should return true when target date passed and goal not met", () => {
      const pastDate = new Date("2020-01-01").toISOString();
      expect(isGoalDelayed(50000, 100000, pastDate)).toBe(true);
    });

    it("should return false when target date passed but goal is met", () => {
      const pastDate = new Date("2020-01-01").toISOString();
      expect(isGoalDelayed(100000, 100000, pastDate)).toBe(false);
    });
  });

  describe("daysUntilTarget", () => {
    it("should return null when no target date", () => {
      expect(daysUntilTarget(undefined)).toBeNull();
    });

    it("should return 0 for past dates", () => {
      expect(daysUntilTarget("2020-01-01")).toBe(0);
    });

    it("should return positive days for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const result = daysUntilTarget(futureDate.toISOString());
      expect(result).toBeGreaterThanOrEqual(29);
      expect(result).toBeLessThanOrEqual(31);
    });
  });
});
