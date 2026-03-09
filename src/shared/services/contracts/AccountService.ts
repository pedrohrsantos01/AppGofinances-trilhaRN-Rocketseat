import { Account } from "../../domain/entities/Account";

export interface AccountService {
  create(account: Omit<Account, "created_at" | "updated_at" | "version">): Promise<Account>;
  update(id: string, data: Partial<Account>): Promise<Account>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Account | null>;
  listByUser(userId: string): Promise<Account[]>;
  getBalance(id: string): Promise<number>;
}
