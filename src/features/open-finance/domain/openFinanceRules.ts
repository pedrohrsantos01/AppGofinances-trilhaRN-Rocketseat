import { Transaction } from "../../../shared/domain/entities/Transaction";
import { OpenFinanceConnection } from "../../../shared/domain/entities/OpenFinanceConnection";

export interface ProviderTransaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: "CREDIT" | "DEBIT";
  date: string;
  category: string;
}

const RENEWAL_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Maps a provider transaction (Open Finance format) to the internal Transaction model.
 */
export function mapProviderTransaction(
  provider: ProviderTransaction,
  userId: string,
  accountId: string
): Transaction {
  return {
    id: `of-${provider.id}`,
    amount_cents: Math.round(provider.amount * 100),
    currency: "BRL",
    type: provider.type === "CREDIT" ? "income" : "expense",
    status: "confirmed",
    source: "open_finance",
    name: provider.description,
    category_id: mapCategory(provider.category),
    account_id: accountId,
    date: provider.date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    user_id: userId,
  };
}

/**
 * Checks if a connection's consent is currently valid.
 * Must be active status and not expired.
 */
export function isConsentValid(connection: OpenFinanceConnection): boolean {
  if (connection.status !== "active") return false;
  return new Date(connection.consent_expires_at) > new Date();
}

/**
 * Checks if consent needs renewal (expires within 7 days or already expired).
 */
export function needsConsentRenewal(connection: OpenFinanceConnection): boolean {
  const expiresAt = new Date(connection.consent_expires_at).getTime();
  const now = Date.now();
  return expiresAt - now < RENEWAL_THRESHOLD_MS;
}

/**
 * Deduplicates imported transactions against existing ones.
 * Matches by name + amount_cents + date (YYYY-MM-DD).
 */
export function deduplicateImported(
  incoming: Transaction[],
  existing: Transaction[]
): Transaction[] {
  const existingKeys = new Set(
    existing.map((tx) => `${tx.name}|${tx.amount_cents}|${tx.date.slice(0, 10)}`)
  );

  return incoming.filter((tx) => {
    const key = `${tx.name}|${tx.amount_cents}|${tx.date.slice(0, 10)}`;
    return !existingKeys.has(key);
  });
}

function mapCategory(providerCategory: string): string {
  const mapping: Record<string, string> = {
    PIX: "purchases",
    COMPRAS: "purchases",
    ALIMENTACAO: "food",
    TRANSPORTE: "car",
    LAZER: "leisure",
    EDUCACAO: "studies",
    SALARIO: "salary",
    TARIFA: "purchases",
  };
  return mapping[providerCategory] ?? "purchases";
}
