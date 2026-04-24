import fs from "fs";
import path from "path";

describe("Supabase production migration", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/202604240001_architecture_2_core.sql"
  );

  it("defines remote finance tables with RLS, sharing, and sync indexes", () => {
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("create table if not exists public.accounts");
    expect(sql).toContain("create table if not exists public.transactions");
    expect(sql).toContain("create table if not exists public.shared_access");
    expect(sql).toContain("create table if not exists public.sync_mutations");
    expect(sql).toContain("alter table public.transactions enable row level security");
    expect(sql).toContain("auth.uid() = user_id");
    expect(sql).toContain("idx_transactions_user_updated");
    expect(sql).toContain("idx_budgets_user_month_year");
  });
});
