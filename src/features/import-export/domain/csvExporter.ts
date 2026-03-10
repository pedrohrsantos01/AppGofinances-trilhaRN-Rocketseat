import { Transaction } from "../../../shared/domain/entities/Transaction";
import { Money } from "../../../shared/domain/value-objects/Money";

export function transactionsToCSV(transactions: Transaction[]): string {
  const header = "data,descricao,valor,tipo,categoria,conta";
  const lines = transactions.map((tx) => {
    const amount = Money.fromCents(tx.amount_cents).toFormatted();
    const escapedName = tx.name.includes(",") ? `"${tx.name}"` : tx.name;
    return `${tx.date},${escapedName},${amount},${tx.type},${tx.category_id},${tx.account_id}`;
  });
  return [header, ...lines].join("\n");
}
