import { SupabaseSharingService } from "../services/supabaseSharingService";
import { SupabaseSyncService } from "../services/supabaseSyncService";
import { AuthenticatedUser, SyncMutation } from "../types";
import { DatabaseClient } from "../supabase/database";

class FakeDatabaseClient implements DatabaseClient {
  rows: Record<string, Record<string, unknown>[]> = {};
  upserts: { table: string; values: Record<string, unknown> }[] = [];
  inserts: { table: string; values: Record<string, unknown> }[] = [];
  updates: { table: string; values: Record<string, unknown>; filters: Record<string, unknown> }[] =
    [];
  findManyCalls: { table: string; filters: Record<string, unknown> }[] = [];

  constructor(initialRows: Record<string, Record<string, unknown>[]> = {}) {
    this.rows = initialRows;
  }

  async findOne(
    table: string,
    filters: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> {
    return (
      (this.rows[table] ?? []).find((row) =>
        Object.entries(filters).every(([key, value]) => row[key] === value)
      ) ?? null
    );
  }

  async findMany(
    table: string,
    filters: Record<string, unknown>
  ): Promise<Record<string, unknown>[]> {
    this.findManyCalls.push({ table, filters });
    return (this.rows[table] ?? []).filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        if (key === "updated_at_gt") return String(row.updated_at) > String(value);
        return row[key] === value;
      })
    );
  }

  async insertOne(
    table: string,
    values: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.inserts.push({ table, values });
    const row = { ...values, id: values.id ?? `${table}-1`, server_version: 1 };
    this.rows[table] = [...(this.rows[table] ?? []), row];
    return row;
  }

  async upsertOne(
    table: string,
    values: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.upserts.push({ table, values });
    const nextRows = (this.rows[table] ?? []).filter((row) => row.id !== values.id);
    const row = { ...values };
    this.rows[table] = [...nextRows, row];
    return row;
  }

  async updateOne(
    table: string,
    values: Record<string, unknown>,
    filters: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.updates.push({ table, values, filters });
    const current = await this.findOne(table, filters);
    const row = { ...(current ?? filters), ...values };
    this.rows[table] = [...(this.rows[table] ?? []).filter((item) => item.id !== row.id), row];
    return row;
  }
}

describe("SupabaseSyncService", () => {
  const user: AuthenticatedUser = {
    id: "user-1",
    email: "ana@example.com",
    accessToken: "token-1",
  };

  it("upserts accepted mutations with user scoped production fields and records idempotency", async () => {
    const db = new FakeDatabaseClient();
    const service = new SupabaseSyncService(() => db);
    const mutation: SyncMutation = {
      id: "mutation-1",
      entity_type: "transactions",
      entity_id: "tx-1",
      operation: "insert",
      payload: { id: "tx-1", name: "Mercado", version: 1 },
      idempotency_key: "device-1:mutation-1",
      device_id: "device-1",
      created_at: "2026-04-24T12:00:00.000Z",
    };

    const result = await service.push(user, [mutation]);

    expect(result.conflicts).toEqual([]);
    expect(result.accepted).toEqual([{ id: "mutation-1", entity_id: "tx-1", server_version: 1 }]);
    expect(db.upserts).toEqual([
      {
        table: "transactions",
        values: expect.objectContaining({
          id: "tx-1",
          name: "Mercado",
          user_id: "user-1",
          server_version: 1,
          created_by: "user-1",
          updated_by: "user-1",
        }),
      },
    ]);
    expect(db.inserts).toContainEqual({
      table: "sync_mutations",
      values: expect.objectContaining({
        id: "mutation-1",
        user_id: "user-1",
        entity_type: "transactions",
        idempotency_key: "device-1:mutation-1",
        server_version: 1,
      }),
    });
  });

  it("returns a previous accepted result without rewriting the entity when idempotency key repeats", async () => {
    const db = new FakeDatabaseClient({
      sync_mutations: [
        {
          id: "mutation-1",
          user_id: "user-1",
          entity_id: "tx-1",
          idempotency_key: "device-1:mutation-1",
          server_version: 3,
        },
      ],
    });
    const service = new SupabaseSyncService(() => db);

    const result = await service.push(user, [
      {
        id: "mutation-1",
        entity_type: "transactions",
        entity_id: "tx-1",
        operation: "insert",
        payload: { id: "tx-1", name: "Mercado", version: 1 },
        idempotency_key: "device-1:mutation-1",
        device_id: "device-1",
        created_at: "2026-04-24T12:00:00.000Z",
      },
    ]);

    expect(result.accepted).toEqual([{ id: "mutation-1", entity_id: "tx-1", server_version: 3 }]);
    expect(db.upserts).toHaveLength(0);
  });

  it("pulls remote deltas from all sync entities using the cursor", async () => {
    const db = new FakeDatabaseClient({
      transactions: [
        {
          id: "tx-1",
          user_id: "user-1",
          name: "Mercado",
          server_version: 2,
          updated_at: "2026-04-24T12:00:00.000Z",
          deleted_at: null,
        },
      ],
    });
    const service = new SupabaseSyncService(() => db);

    const result = await service.pull(user, "2026-04-24T00:00:00.000Z");

    expect(result.changes).toContainEqual({
      entity_type: "transactions",
      entity_id: "tx-1",
      server_version: 2,
      updated_at: "2026-04-24T12:00:00.000Z",
      deleted_at: null,
      payload: expect.objectContaining({ id: "tx-1", version: 2 }),
    });
    expect(result.cursor).toBe("2026-04-24T12:00:00.000Z");
    expect(db.findManyCalls).toContainEqual({
      table: "transactions",
      filters: { user_id: "user-1", updated_at_gt: "2026-04-24T00:00:00.000Z" },
    });
  });
});

describe("SupabaseSharingService", () => {
  const user: AuthenticatedUser = {
    id: "owner-1",
    email: "owner@example.com",
    accessToken: "token-1",
  };

  it("creates sharing invites in shared_access with the authenticated owner", async () => {
    const db = new FakeDatabaseClient();
    const service = new SupabaseSharingService(() => db);

    const invite = await service.createInvite(user, {
      email: "viewer@example.com",
      role: "viewer",
    });

    expect(invite).toEqual(
      expect.objectContaining({
        owner_user_id: "owner-1",
        shared_with_email: "viewer@example.com",
        role: "viewer",
        status: "pending",
        version: 1,
      })
    );
    expect(db.inserts).toContainEqual({
      table: "shared_access",
      values: expect.objectContaining({
        owner_user_id: "owner-1",
        shared_with_email: "viewer@example.com",
        role: "viewer",
        status: "pending",
      }),
    });
  });

  it("revokes only invites owned by the authenticated user", async () => {
    const db = new FakeDatabaseClient({
      shared_access: [
        {
          id: "share-1",
          owner_user_id: "owner-1",
          shared_with_user_id: null,
          shared_with_email: "viewer@example.com",
          role: "viewer",
          status: "pending",
          server_version: 2,
          created_at: "2026-04-24T12:00:00.000Z",
          updated_at: "2026-04-24T12:00:00.000Z",
        },
      ],
    });
    const service = new SupabaseSharingService(() => db);

    const revoked = await service.revoke(user, "share-1");

    expect(revoked.status).toBe("revoked");
    expect(revoked.version).toBe(3);
    expect(db.updates).toContainEqual({
      table: "shared_access",
      values: expect.objectContaining({ status: "revoked", server_version: 3 }),
      filters: { id: "share-1", owner_user_id: "owner-1" },
    });
  });
});
