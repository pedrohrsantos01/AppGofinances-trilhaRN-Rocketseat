import uuid from "react-native-uuid";
import { Account, AccountType } from "../../../shared/domain/entities/Account";
import { AppError } from "../../../shared/domain/errors/AppError";
import { AccountRepository } from "../infra/AccountRepository";

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  color?: string;
  icon?: string;
  userId: string;
}

const accountRepo = new AccountRepository();

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  if (!input.name.trim()) {
    throw new AppError("VALIDATION_ERROR", "Nome da conta é obrigatório");
  }

  const now = new Date().toISOString();

  const account: Account = {
    id: String(uuid.v4()),
    name: input.name.trim(),
    type: input.type,
    balance_cents: 0,
    currency: "BRL",
    color: input.color ?? "#5636D3",
    icon: input.icon ?? "wallet",
    is_active: true,
    created_at: now,
    updated_at: now,
    version: 1,
    user_id: input.userId,
  };

  return accountRepo.create(account);
}
