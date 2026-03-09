import { Transaction } from "../../../shared/domain/entities/Transaction";
import { InvoiceStatus } from "../../../shared/domain/entities/Invoice";

export function calculateInvoiceTotal(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.status !== "cancelled")
    .reduce((sum, t) => sum + t.amount_cents, 0);
}

interface InvoiceStatusInput {
  total_cents: number;
  paid_cents: number;
  closing_date: string;
  due_date: string;
  today: string;
}

export function getInvoiceStatus(input: InvoiceStatusInput): InvoiceStatus {
  const { total_cents, paid_cents, closing_date, due_date, today } = input;

  if (paid_cents >= total_cents && total_cents > 0) {
    return "paid";
  }

  const todayDate = new Date(today);
  const dueDate = new Date(due_date);
  const closingDate = new Date(closing_date);

  if (todayDate > dueDate && paid_cents < total_cents) {
    return "overdue";
  }

  if (todayDate > closingDate) {
    if (paid_cents > 0 && paid_cents < total_cents) {
      return "partially_paid";
    }
    return "closed";
  }

  return "open";
}

interface InvoiceDatesInput {
  closingDay: number;
  dueDay: number;
  month: number;
  year: number;
}

interface InvoiceDatesResult {
  closing_date: string;
  due_date: string;
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

export function generateInvoiceDates(input: InvoiceDatesInput): InvoiceDatesResult {
  const { closingDay, dueDay, month, year } = input;

  const maxClosingDay = daysInMonth(month, year);
  const clampedClosingDay = Math.min(closingDay, maxClosingDay);

  const closing_date = `${year}-${padTwo(month)}-${padTwo(clampedClosingDay)}`;

  let dueMonth = month;
  let dueYear = year;

  if (dueDay <= closingDay) {
    dueMonth = month + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear = year + 1;
    }
  }

  const due_date = `${dueYear}-${padTwo(dueMonth)}-${padTwo(dueDay)}`;

  return { closing_date, due_date };
}
