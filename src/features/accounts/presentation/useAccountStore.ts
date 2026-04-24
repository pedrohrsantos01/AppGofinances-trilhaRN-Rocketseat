import { create } from "zustand";
import type { Account } from "../../../shared/domain/entities/Account";
import { AccountRepository } from "../infra/AccountRepository";

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  selectedAccountId: string | null;
  loadAccounts: (userId: string) => Promise<void>;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  removeAccount: (id: string) => void;
  selectAccount: (id: string | null) => void;
}

const accountRepo = new AccountRepository();

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: false,
  selectedAccountId: null,

  loadAccounts: async (userId: string) => {
    set({ isLoading: true });
    const accounts = await accountRepo.listByUser(userId);
    set({ accounts, isLoading: false });
  },

  addAccount: (account: Account) => {
    set((state) => ({ accounts: [...state.accounts, account] }));
  },

  updateAccount: (account: Account) => {
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === account.id ? account : a)),
    }));
  },

  removeAccount: (id: string) => {
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    }));
  },

  selectAccount: (id: string | null) => {
    set({ selectedAccountId: id });
  },
}));
