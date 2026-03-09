export const CREATE_ACCOUNTS_TABLE = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'cash',
    balance_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    color TEXT NOT NULL DEFAULT '#5636D3',
    icon TEXT NOT NULL DEFAULT 'wallet',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL
  );
`;

export const CREATE_CREDIT_CARDS_TABLE = `
  CREATE TABLE IF NOT EXISTS credit_cards (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    limit_cents INTEGER NOT NULL,
    closing_day INTEGER NOT NULL,
    due_day INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    color TEXT NOT NULL DEFAULT '#FF872C',
    is_active INTEGER NOT NULL DEFAULT 1,
    account_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
`;

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    source TEXT NOT NULL DEFAULT 'manual',
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    credit_card_id TEXT,
    recurring_rule_id TEXT,
    installment_group_id TEXT,
    installment_number INTEGER,
    installment_total INTEGER,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
`;

export const CREATE_INVOICES_TABLE = `
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY NOT NULL,
    credit_card_id TEXT NOT NULL,
    reference_month INTEGER NOT NULL,
    reference_year INTEGER NOT NULL,
    total_cents INTEGER NOT NULL DEFAULT 0,
    paid_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    closing_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id)
  );
`;

export const ALL_TABLES = [
  CREATE_ACCOUNTS_TABLE,
  CREATE_CREDIT_CARDS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_INVOICES_TABLE,
];
