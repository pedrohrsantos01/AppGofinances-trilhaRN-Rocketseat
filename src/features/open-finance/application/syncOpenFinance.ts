import { Transaction } from "../../../shared/domain/entities/Transaction";
import { OpenFinanceConnection } from "../../../shared/domain/entities/OpenFinanceConnection";
import { AppError } from "../../../shared/domain/errors/AppError";
import { TransactionRepository } from "../../transactions/infra/TransactionRepository";
import { OpenFinanceProvider } from "../infra/OpenFinanceProvider";
import {
  mapProviderTransaction,
  isConsentValid,
  deduplicateImported,
} from "../domain/openFinanceRules";

const txRepo = new TransactionRepository();

/**
 * Syncs transactions from an Open Finance connection.
 * Fetches from provider, maps to internal model, deduplicates, and persists.
 */
export async function syncOpenFinanceTransactions(
  connection: OpenFinanceConnection,
  provider: OpenFinanceProvider,
  accountId: string,
  fromDate: string,
  toDate: string
): Promise<{ imported: number; skipped: number }> {
  if (!isConsentValid(connection)) {
    throw new AppError(
      "AUTH_REQUIRED",
      "Consentimento expirado ou revogado. Renove a autorizacao."
    );
  }

  const providerTxs = await provider.fetchTransactions(connection.consent_id, fromDate, toDate);

  const mapped: Transaction[] = providerTxs.map((ptx) =>
    mapProviderTransaction(ptx, connection.user_id, accountId)
  );

  const existing = await txRepo.listByUser(connection.user_id);
  const unique = deduplicateImported(mapped, existing);

  if (unique.length > 0) {
    await txRepo.createMany(unique);
  }

  return {
    imported: unique.length,
    skipped: mapped.length - unique.length,
  };
}
