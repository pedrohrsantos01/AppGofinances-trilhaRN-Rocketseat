create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'cash',
  balance_cents integer not null default 0,
  currency text not null default 'BRL',
  color text not null default '#5636D3',
  icon text not null default 'wallet',
  is_active boolean not null default true,
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.credit_cards (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null references public.accounts(id),
  name text not null,
  limit_cents integer not null,
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  currency text not null default 'BRL',
  color text not null default '#FF872C',
  is_active boolean not null default true,
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.transactions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null references public.accounts(id),
  credit_card_id text references public.credit_cards(id),
  amount_cents integer not null,
  currency text not null default 'BRL',
  type text not null check (type in ('income', 'expense', 'transfer')),
  status text not null default 'confirmed',
  source text not null default 'manual',
  name text not null,
  category_id text not null,
  recurring_rule_id text,
  installment_group_id text,
  installment_number integer,
  installment_total integer,
  date date not null,
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.invoices (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_card_id text not null references public.credit_cards(id),
  reference_month integer not null check (reference_month between 1 and 12),
  reference_year integer not null,
  total_cents integer not null default 0,
  paid_cents integer not null default 0,
  status text not null default 'open',
  closing_date date not null,
  due_date date not null,
  currency text not null default 'BRL',
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.budgets (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  limit_cents integer not null,
  spent_cents integer not null default 0,
  month integer not null check (month between 1 and 12),
  year integer not null,
  rollover boolean not null default false,
  currency text not null default 'BRL',
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, category_id, month, year)
);

create table if not exists public.reminders (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  amount_cents integer not null default 0,
  category_id text,
  is_completed boolean not null default false,
  recurrence text,
  notify_days_before integer not null default 3,
  notification_id text,
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.goals (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_cents integer not null,
  current_cents integer not null default 0,
  currency text not null default 'BRL',
  status text not null default 'active',
  target_date date,
  color text not null default '#5636D3',
  icon text not null default 'flag',
  server_version bigint not null default 1,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.shared_access (
  id text primary key default gen_random_uuid()::text,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id uuid references auth.users(id) on delete cascade,
  shared_with_email text not null,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  status text not null default 'pending',
  server_version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.open_finance_connections (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id text not null,
  institution_name text not null,
  consent_id text not null,
  status text not null,
  scopes text[] not null default '{}',
  consent_expires_at timestamptz not null,
  last_sync_at timestamptz,
  server_version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.sync_mutations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  idempotency_key text not null unique,
  device_id text not null,
  payload jsonb,
  status text not null default 'accepted',
  server_version bigint not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id text,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_accounts_user_updated on public.accounts (user_id, updated_at);
create index if not exists idx_credit_cards_user_updated on public.credit_cards (user_id, updated_at);
create index if not exists idx_transactions_user_updated on public.transactions (user_id, updated_at);
create index if not exists idx_transactions_account_date on public.transactions (account_id, date);
create index if not exists idx_transactions_category_date on public.transactions (category_id, date);
create index if not exists idx_invoices_user_updated on public.invoices (user_id, updated_at);
create index if not exists idx_budgets_user_month_year on public.budgets (user_id, month, year);
create index if not exists idx_reminders_user_updated on public.reminders (user_id, updated_at);
create index if not exists idx_goals_user_updated on public.goals (user_id, updated_at);
create index if not exists idx_shared_access_owner on public.shared_access (owner_user_id, status);
create index if not exists idx_shared_access_guest on public.shared_access (shared_with_user_id, status);
create index if not exists idx_open_finance_user_updated on public.open_finance_connections (user_id, updated_at);
create index if not exists idx_sync_mutations_user_created on public.sync_mutations (user_id, created_at);

alter table public.accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.invoices enable row level security;
alter table public.budgets enable row level security;
alter table public.reminders enable row level security;
alter table public.goals enable row level security;
alter table public.shared_access enable row level security;
alter table public.open_finance_connections enable row level security;
alter table public.sync_mutations enable row level security;
alter table public.audit_log enable row level security;

create policy accounts_owner_all on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy credit_cards_owner_all on public.credit_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy transactions_owner_all on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy invoices_owner_all on public.invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy budgets_owner_all on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy reminders_owner_all on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy goals_owner_all on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy open_finance_owner_all on public.open_finance_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy sync_mutations_owner_all on public.sync_mutations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy audit_log_owner_read on public.audit_log
  for select using (auth.uid() = user_id or auth.uid() = actor_user_id);

create policy shared_access_owner_manage on public.shared_access
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy shared_access_guest_read on public.shared_access
  for select using (auth.uid() = shared_with_user_id and status = 'accepted');

create policy accounts_shared_read on public.accounts
  for select using (
    exists (
      select 1 from public.shared_access sa
      where sa.owner_user_id = accounts.user_id
        and sa.shared_with_user_id = auth.uid()
        and sa.status = 'accepted'
        and sa.role in ('viewer', 'editor')
    )
  );

create policy transactions_shared_read on public.transactions
  for select using (
    exists (
      select 1 from public.shared_access sa
      where sa.owner_user_id = transactions.user_id
        and sa.shared_with_user_id = auth.uid()
        and sa.status = 'accepted'
        and sa.role in ('viewer', 'editor')
    )
  );

create policy budgets_shared_read on public.budgets
  for select using (
    exists (
      select 1 from public.shared_access sa
      where sa.owner_user_id = budgets.user_id
        and sa.shared_with_user_id = auth.uid()
        and sa.status = 'accepted'
        and sa.role in ('viewer', 'editor')
    )
  );
