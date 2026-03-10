import {
  calculateUpcomingDues,
  shouldNotify,
} from "../../../../features/calendar/domain/upcomingDues";

describe("calculateUpcomingDues", () => {
  const reminders = [
    {
      id: "r1",
      title: "Aluguel",
      due_date: "2025-03-20",
      amount_cents: 150000,
      is_completed: false,
    },
    {
      id: "r2",
      title: "Internet",
      due_date: "2025-03-25",
      amount_cents: 9990,
      is_completed: false,
    },
    {
      id: "r3",
      title: "Luz",
      due_date: "2025-04-05",
      amount_cents: 18000,
      is_completed: false,
    },
    {
      id: "r4",
      title: "Pago",
      due_date: "2025-03-22",
      amount_cents: 5000,
      is_completed: true,
    },
  ];

  it("should return reminders within the next N days", () => {
    const result = calculateUpcomingDues(reminders, "2025-03-18", 7);
    expect(result).toHaveLength(2); // r1 (Mar 20) and r2 (Mar 25)
  });

  it("should exclude completed reminders", () => {
    const result = calculateUpcomingDues(reminders, "2025-03-18", 30);
    const ids = result.map((r) => r.id);
    expect(ids).not.toContain("r4");
  });

  it("should sort by due_date ascending", () => {
    const result = calculateUpcomingDues(reminders, "2025-03-18", 30);
    expect(result[0].title).toBe("Aluguel");
    expect(result[1].title).toBe("Internet");
    expect(result[2].title).toBe("Luz");
  });

  it("should return empty for no upcoming", () => {
    const result = calculateUpcomingDues(reminders, "2025-05-01", 7);
    expect(result).toHaveLength(0);
  });

  it("should include due date exactly on boundary", () => {
    const result = calculateUpcomingDues(reminders, "2025-03-18", 2);
    expect(result).toHaveLength(1); // Mar 20 is exactly 2 days away
  });

  it("should exclude past due dates", () => {
    const result = calculateUpcomingDues(reminders, "2025-03-26", 7);
    const ids = result.map((r) => r.id);
    expect(ids).not.toContain("r1");
    expect(ids).not.toContain("r2");
  });
});

describe("shouldNotify", () => {
  it("should notify 3 days before due", () => {
    expect(shouldNotify("2025-03-20", "2025-03-17", 3)).toBe(true);
  });

  it("should notify on due date", () => {
    expect(shouldNotify("2025-03-20", "2025-03-20", 3)).toBe(true);
  });

  it("should not notify too early", () => {
    expect(shouldNotify("2025-03-20", "2025-03-10", 3)).toBe(false);
  });

  it("should not notify after due date", () => {
    expect(shouldNotify("2025-03-20", "2025-03-21", 3)).toBe(false);
  });
});
