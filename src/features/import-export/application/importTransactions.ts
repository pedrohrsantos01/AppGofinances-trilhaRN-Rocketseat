import uuid from "react-native-uuid";
import { parseCSV, deduplicateByHash, ColumnMapping } from "../domain/csvParser";
import { Transaction } from "../../../shared/domain/entities/Transaction";

interface ImportResult {
  imported: number;
  duplicates: number;
  errors: { line: number; message: string }[];
}

export function processCSVImport(
  csvContent: string,
  mapping: ColumnMapping,
  userId: string,
  accountId: string,
  categoryId: string
): { transactions: Transaction[]; result: ImportResult } {
  const parsed = parseCSV(csvContent, mapping);
  const uniqueRows = deduplicateByHash(parsed.rows);
  const duplicates = parsed.rows.length - uniqueRows.length;

  const now = new Date().toISOString();
  const transactions: Transaction[] = uniqueRows.map((row) => ({
    id: String(uuid.v4()),
    amount_cents: row.amount_cents,
    currency: "BRL" as const,
    type: row.type,
    status: "confirmed" as const,
    source: "import" as const,
    name: row.name,
    category_id: categoryId,
    account_id: accountId,
    date: row.date,
    created_at: now,
    updated_at: now,
    version: 1,
    user_id: userId,
  }));

  return {
    transactions,
    result: {
      imported: transactions.length,
      duplicates,
      errors: parsed.errors,
    },
  };
}
