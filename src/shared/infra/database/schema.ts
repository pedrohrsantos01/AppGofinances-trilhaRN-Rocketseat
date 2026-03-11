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

export const CREATE_BUDGETS_TABLE = `
  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY NOT NULL,
    category_id TEXT NOT NULL,
    limit_cents INTEGER NOT NULL,
    spent_cents INTEGER NOT NULL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    rollover INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL,
    UNIQUE(user_id, category_id, month, year)
  );
`;

export const CREATE_REMINDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    category_id TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    recurrence TEXT,
    notify_days_before INTEGER NOT NULL DEFAULT 3,
    notification_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    user_id TEXT NOT NULL
  );
`;

export const CREATE_GOALS_TABLE = `
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    target_cents INTEGER NOT NULL,
    current_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'active',
    target_date TEXT,
    color TEXT NOT NULL DEFAULT '#5636D3',
    icon TEXT NOT NULL DEFAULT 'flag',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    user_id TEXT NOT NULL
  );
`;

export const CREATE_SYNC_QUEUE_TABLE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`;

export const ALL_TABLES = [
  CREATE_ACCOUNTS_TABLE,
  CREATE_CREDIT_CARDS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_INVOICES_TABLE,
  CREATE_BUDGETS_TABLE,
  CREATE_REMINDERS_TABLE,
  CREATE_GOALS_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
];
