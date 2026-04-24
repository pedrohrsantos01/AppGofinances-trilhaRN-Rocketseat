import {
  AuthenticatedUser,
  SyncEntityType,
  SyncMutation,
  SyncPullResult,
  SyncPushResult,
  SyncRemoteChange,
  SyncService,
} from "../types";
import { createUserDatabaseClient, DatabaseClient } from "../supabase/database";

type DatabaseClientFactory = (user: AuthenticatedUser) => DatabaseClient;
type Row = Record<string, unknown>;

const ENTITY_TABLES: Record<SyncEntityType, string> = {
  accounts: "accounts",
  credit_cards: "credit_cards",
  transactions: "transactions",
  invoices: "invoices",
  budgets: "budgets",
  reminders: "reminders",
  goals: "goals",
};

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePayload(
  user: AuthenticatedUser,
  mutation: SyncMutation,
  serverVersion: number
): Row {
  const payload = { ...(mutation.payload ?? {}) };
  delete payload.version;
  delete payload.deleted_at;
  delete payload.server_version;
  delete payload.created_by;
  delete payload.updated_by;

  return {
    ...payload,
    id: mutation.entity_id,
    user_id: user.id,
    server_version: serverVersion,
    created_by: user.id,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
}

function rowToRemoteChange(entityType: SyncEntityType, row: Row): SyncRemoteChange {
  const serverVersion = toNumber(row.server_version, 1);
  const payload = row.deleted_at
    ? null
    : {
        ...row,
        version: serverVersion,
      };

  return {
    entity_type: entityType,
    entity_id: String(row.id),
    payload,
    server_version: serverVersion,
    updated_at: String(row.updated_at),
    deleted_at: row.deleted_at ? String(row.deleted_at) : null,
  };
}

export class SupabaseSyncService implements SyncService {
  constructor(
    private readonly createDatabaseClient: DatabaseClientFactory = createUserDatabaseClient
  ) {}

  async push(user: AuthenticatedUser, mutations: SyncMutation[]): Promise<SyncPushResult> {
    const db = this.createDatabaseClient(user);
    const accepted: SyncPushResult["accepted"] = [];
    const conflicts: SyncPushResult["conflicts"] = [];

    for (const mutation of mutations) {
      const previous = await db.findOne("sync_mutations", {
        user_id: user.id,
        idempotency_key: mutation.idempotency_key,
      });

      if (previous) {
        accepted.push({
          id: mutation.id,
          entity_id: String(previous.entity_id),
          server_version: toNumber(previous.server_version, 1),
        });
        continue;
      }

      const table = ENTITY_TABLES[mutation.entity_type];
      if (!table) {
        conflicts.push({
          id: mutation.id,
          entity_id: mutation.entity_id,
          reason: "unknown_entity",
        });
        continue;
      }

      if (mutation.operation !== "delete" && !mutation.payload) {
        conflicts.push({
          id: mutation.id,
          entity_id: mutation.entity_id,
          reason: "missing_payload",
        });
        continue;
      }

      const current = await db.findOne(table, { id: mutation.entity_id, user_id: user.id });
      const currentVersion = toNumber(current?.server_version, 0);
      const localVersion = toNumber(
        mutation.payload?.version ?? mutation.payload?.server_version,
        0
      );

      if (current && localVersion > 0 && currentVersion > localVersion) {
        conflicts.push({ id: mutation.id, entity_id: mutation.entity_id, reason: "remote_newer" });
        continue;
      }

      const serverVersion = Math.max(currentVersion + 1, 1);

      if (mutation.operation === "delete") {
        if (current) {
          await db.updateOne(
            table,
            {
              deleted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              updated_by: user.id,
              server_version: serverVersion,
            },
            { id: mutation.entity_id, user_id: user.id }
          );
        }
      } else {
        await db.upsertOne(table, normalizePayload(user, mutation, serverVersion));
      }

      await db.insertOne("sync_mutations", {
        id: mutation.id,
        user_id: user.id,
        entity_type: mutation.entity_type,
        entity_id: mutation.entity_id,
        operation: mutation.operation,
        idempotency_key: mutation.idempotency_key,
        device_id: mutation.device_id,
        payload: mutation.payload,
        status: "accepted",
        server_version: serverVersion,
        created_at: mutation.created_at,
      });

      accepted.push({
        id: mutation.id,
        entity_id: mutation.entity_id,
        server_version: serverVersion,
      });
    }

    return { accepted, conflicts };
  }

  async pull(user: AuthenticatedUser, since?: string): Promise<SyncPullResult> {
    const db = this.createDatabaseClient(user);
    const changes: SyncRemoteChange[] = [];

    for (const [entityType, table] of Object.entries(ENTITY_TABLES) as [SyncEntityType, string][]) {
      const filters: Row = { user_id: user.id };
      if (since) filters.updated_at_gt = since;

      const rows = await db.findMany(table, filters, {
        orderBy: { column: "updated_at", ascending: true },
      });
      changes.push(...rows.map((row) => rowToRemoteChange(entityType, row)));
    }

    const cursor =
      changes.reduce<string | null>((latest, change) => {
        if (!latest || change.updated_at > latest) return change.updated_at;
        return latest;
      }, null) ??
      since ??
      new Date(0).toISOString();

    return { changes, cursor };
  }
}
