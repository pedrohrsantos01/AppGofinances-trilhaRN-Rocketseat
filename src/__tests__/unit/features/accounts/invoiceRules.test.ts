import {
  calculateInvoiceTotal,
  getInvoiceStatus,
  generateInvoiceDates,
} from "../../../../features/accounts/domain/invoiceRules";
import { Transaction } from "../../../../shared/domain/entities/Transaction";

function makeCardTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t1",
    amount_cents: 10000,
    currency: "BRL",
    type: "expense",
    status: "confirmed",
    source: "manual",
    name: "Compra",
    category_id: "purchases",
    account_id: "acc-1",
    credit_card_id: "card-1",
    date: "2025-03-15T10:00:00.000Z",
    created_at: "2025-03-15T10:00:00.000Z",
    updated_at: "2025-03-15T10:00:00.000Z",
    version: 1,
    user_id: "user-1",
    ...overrides,
  };
}

describe("calculateInvoiceTotal", () => {
  it("should return 0 for empty transactions", () => {
    expect(calculateInvoiceTotal([])).toBe(0);
  });

  it("should sum all transaction amounts", () => {
    const transactions = [
      makeCardTransaction({ amount_cents: 15000 }),
      makeCardTransaction({ id: "t2", amount_cents: 8500 }),
      makeCardTransaction({ id: "t3", amount_cents: 22000 }),
    ];

    expect(calculateInvoiceTotal(transactions)).toBe(45500);
  });

  it("should ignore cancelled transactions", () => {
    const transactions = [
      makeCardTransaction({ amount_cents: 15000 }),
      makeCardTransaction({
        id: "t2",
        amount_cents: 8500,
        status: "cancelled",
      }),
    ];

    expect(calculateInvoiceTotal(transactions)).toBe(15000);
  });
});

describe("getInvoiceStatus", () => {
  it("should return 'open' when before closing date", () => {
    const status = getInvoiceStatus({
      total_cents: 50000,
      paid_cents: 0,
      closing_date: "2025-04-10",
      due_date: "2025-04-20",
      today: "2025-03-25",
    });

    expect(status).toBe("open");
  });

  it("should return 'closed' when after closing but before due and unpaid", () => {
    const status = getInvoiceStatus({
      total_cents: 50000,
      paid_cents: 0,
      closing_date: "2025-03-10",
      due_date: "2025-03-20",
      today: "2025-03-15",
    });

    expect(status).toBe("closed");
  });

  it("should return 'paid' when fully paid", () => {
    const status = getInvoiceStatus({
      total_cents: 50000,
      paid_cents: 50000,
      closing_date: "2025-03-10",
      due_date: "2025-03-20",
      today: "2025-03-25",
    });

    expect(status).toBe("paid");
  });

  it("should return 'partially_paid' when partially paid before due", () => {
    const status = getInvoiceStatus({
      total_cents: 50000,
      paid_cents: 25000,
      closing_date: "2025-03-10",
      due_date: "2025-03-20",
      today: "2025-03-15",
    });

    expect(status).toBe("partially_paid");
  });

  it("should return 'overdue' when past due date and not fully paid", () => {
    const status = getInvoiceStatus({
      total_cents: 50000,
      paid_cents: 0,
      closing_date: "2025-03-10",
      due_date: "2025-03-20",
      today: "2025-03-25",
    });

    expect(status).toBe("overdue");
  });

  it("should return 'overdue' when past due date and partially paid", () => {
    const status = getInvoiceStatus({
      total_cents: 50000,
      paid_cents: 30000,
      closing_date: "2025-03-10",
      due_date: "2025-03-20",
      today: "2025-03-25",
    });

    expect(status).toBe("overdue");
  });

  it("should return 'open' when total is zero", () => {
    const status = getInvoiceStatus({
      total_cents: 0,
      paid_cents: 0,
      closing_date: "2025-03-10",
      due_date: "2025-03-20",
      today: "2025-03-05",
    });

    expect(status).toBe("open");
  });
});

describe("generateInvoiceDates", () => {
  it("should generate closing and due dates for a given month", () => {
    const dates = generateInvoiceDates({
      closingDay: 10,
      dueDay: 20,
      month: 3,
      year: 2025,
    });

    expect(dates.closing_date).toBe("2025-03-10");
    expect(dates.due_date).toBe("2025-03-20");
  });

  it("should handle closing day after due day (next month due)", () => {
    const dates = generateInvoiceDates({
      closingDay: 25,
      dueDay: 5,
      month: 3,
      year: 2025,
    });

    expect(dates.closing_date).toBe("2025-03-25");
    expect(dates.due_date).toBe("2025-04-05");
  });

  it("should handle December closing with January due", () => {
    const dates = generateInvoiceDates({
      closingDay: 25,
      dueDay: 5,
      month: 12,
      year: 2025,
    });

    expect(dates.closing_date).toBe("2025-12-25");
    expect(dates.due_date).toBe("2026-01-05");
  });

  it("should clamp closing day to end of month for short months", () => {
    const dates = generateInvoiceDates({
      closingDay: 31,
      dueDay: 10,
      month: 2,
      year: 2025,
    });

    expect(dates.closing_date).toBe("2025-02-28");
    expect(dates.due_date).toBe("2025-03-10");
  });
});
