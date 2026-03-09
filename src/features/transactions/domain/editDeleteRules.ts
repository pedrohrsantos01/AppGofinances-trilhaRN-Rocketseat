import { Transaction } from "../../../shared/domain/entities/Transaction";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface EditFields {
  name?: string;
  amount_cents?: number;
  type?: Transaction["type"];
  category_id?: string;
}

export function validateTransactionEdit(fields: EditFields): ValidationResult {
  const errors: string[] = [];

  if (fields.name !== undefined && !fields.name.trim()) {
    errors.push("Nome é obrigatório");
  }

  if (fields.amount_cents !== undefined && fields.amount_cents <= 0) {
    errors.push("Valor deve ser maior que zero");
  }

  return { valid: errors.length === 0, errors };
}

function effectiveAmount(tx: Transaction): number {
  if (tx.type === "income") return tx.amount_cents;
  return -tx.amount_cents;
}

export function computeBalanceImpact(
  operation: "edit" | "delete",
  oldTx: Transaction,
  newTx?: Transaction
): number {
  if (operation === "delete") {
    return -effectiveAmount(oldTx);
  }

  if (!newTx) return 0;

  return effectiveAmount(newTx) - effectiveAmount(oldTx);
}
