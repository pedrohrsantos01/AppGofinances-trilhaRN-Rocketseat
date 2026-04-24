import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { AuthenticatedUser } from "../types";

type Row = Record<string, unknown>;

interface FindManyOptions {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export interface DatabaseClient {
  findOne(table: string, filters: Row): Promise<Row | null>;
  findMany(table: string, filters: Row, options?: FindManyOptions): Promise<Row[]>;
  insertOne(table: string, values: Row): Promise<Row>;
  upsertOne(table: string, values: Row): Promise<Row>;
  updateOne(table: string, values: Row, filters: Row): Promise<Row>;
}

function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

function applyFilters(query: any, filters: Row): any {
  return Object.entries(filters).reduce((current, [column, value]) => {
    if (column.endsWith("_gt")) {
      return current.gt(column.replace(/_gt$/, ""), value);
    }

    if (value === null) {
      return current.is(column, null);
    }

    return current.eq(column, value);
  }, query);
}

export class SupabaseDatabaseClient implements DatabaseClient {
  constructor(private readonly client: SupabaseClient) {}

  async findOne(table: string, filters: Row): Promise<Row | null> {
    const query = applyFilters(this.client.from(table).select("*"), filters).maybeSingle();
    const { data, error } = await query;
    if (error) throw error;
    return data as Row | null;
  }

  async findMany(table: string, filters: Row, options: FindManyOptions = {}): Promise<Row[]> {
    let query = applyFilters(this.client.from(table).select("*"), filters);

    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Row[];
  }

  async insertOne(table: string, values: Row): Promise<Row> {
    const { data, error } = await this.client.from(table).insert(values).select("*").single();
    if (error) throw error;
    return data as Row;
  }

  async upsertOne(table: string, values: Row): Promise<Row> {
    const { data, error } = await this.client
      .from(table)
      .upsert(values, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return data as Row;
  }

  async updateOne(table: string, values: Row, filters: Row): Promise<Row> {
    const query = applyFilters(this.client.from(table).update(values), filters)
      .select("*")
      .single();
    const { data, error } = await query;
    if (error) throw error;
    return data as Row;
  }
}

export function createUserDatabaseClient(user: AuthenticatedUser): DatabaseClient {
  const { url, anonKey } = requireSupabaseEnv();
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {},
    },
  });

  return new SupabaseDatabaseClient(client);
}
