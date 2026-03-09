import { Account } from "../../../shared/domain/entities/Account";
import { AccountRepository } from "../infra/AccountRepository";

const accountRepo = new AccountRepository();

export async function listAccounts(userId: string): Promise<Account[]> {
  return accountRepo.listByUser(userId);
}
