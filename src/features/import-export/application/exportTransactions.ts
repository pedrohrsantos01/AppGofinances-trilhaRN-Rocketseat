import { transactionsToCSV } from "../domain/csvExporter";
import { Transaction } from "../../../shared/domain/entities/Transaction";

export function exportToCSV(transactions: Transaction[]): string {
  return transactionsToCSV(transactions);
}
