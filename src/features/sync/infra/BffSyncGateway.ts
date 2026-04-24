import { ApiClient } from "../../../shared/infra/http/ApiClient";
import { getDatabase } from "../../../shared/infra/database/database";
import { processPendingQueue } from "../application/syncService";
import { mergeByVersion, SyncQueueItem, VersionedRecord } from "../domain/syncQueue";

export type SyncEntityType =
  | "accounts"
  | "credit_cards"
  | "transactions"
  | "invoices"
  | "budgets"
  | "reminders"
  | "goals";

export interface SyncMutation {
  id: string;
  entity_type: SyncEntityType;
  entity_id: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown> | null;
  idempotency_key: string;
  device_id: string;
  created_at: string;
}

export interface SyncRemoteChange {
  entity_type: SyncEntityType;
  entity_id: string;
  payload: Record<string, unknown> | null;
  server_version: number;
  updated_at: string;
  deleted_at: string | null;
}

export interface SyncPushResult {
  accepted: { id: string; entity_id: string; server_version: number }[];
  conflicts: { id: string; entity_id: string; reason: string }[];
}

export interface SyncPullResult {
  changes: SyncRemoteChange[];
  cursor: string;
}

const ENTITY_TABLES: Record<string, string> = {
  accounts: "accounts",
  credit_cards: "credit_cards",
  transactions: "transactions",
  invoices: "invoices",
  budgets: "budgets",
  reminders: "reminders",
  goals: "goals",
};

function getDeviceId(): string {
  return "local-device";
}

export function queueItemToMutation(item: SyncQueueItem): SyncMutation {
  const deviceId = getDeviceId();

  return {
    id: item.id,
    entity_type: item.entity_type as SyncEntityType,
    entity_id: item.entity_id,
    operation: item.operation,
    payload: item.payload,
    idempotency_key: `${deviceId}:${item.id}`,
    device_id: deviceId,
    created_at: item.created_at,
  };
}

export async function pushToBff(
  client: ApiClient,
  mutations: SyncMutation[]
): Promise<SyncPushResult> {
  return client.request<SyncPushResult>("/v1/sync/push", {
    method: "POST",
    body: { mutations },
  });
}

export async function pullFromBff(client: ApiClient, since?: string): Promise<SyncPullResult> {
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return client.request<SyncPullResult>(`/v1/sync/pull${query}`);
}

function normalizeRemoteRecord(change: SyncRemoteChange): Record<string, unknown> | null {
  if (!change.payload) return null;

  const record: Record<string, unknown> = {
    ...change.payload,
    id: change.entity_id,
    updated_at: change.updated_at,
    version: (change.payload.version as number | undefined) ?? change.server_version,
  };

  delete record.server_version;
  delete record.deleted_at;
  delete record.created_by;
  delete record.updated_by;

  return record;
}

export async function applyRemoteChanges(
  changes: SyncRemoteChange[]
): Promise<{ applied: number; conflicts: number }> {
  const db = await getDatabase();
  let applied = 0;
  let conflicts = 0;

  for (const change of changes) {
    const table = ENTITY_TABLES[change.entity_type];
    if (!table) continue;

    if (change.deleted_at) {
      await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [change.entity_id]);
      applied++;
      continue;
    }

    const record = normalizeRemoteRecord(change);
    if (!record) continue;

    const localRow = await db.getFirstAsync<{ version: number; updated_at: string }>(
      `SELECT version, updated_at FROM ${table} WHERE id = ?`,
      [change.entity_id]
    );

    if (!localRow) {
      const columns = Object.keys(record);
      const placeholders = columns.map(() => "?").join(", ");
      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
        columns.map((column) => record[column] as string | number | null)
      );
      applied++;
      continue;
    }

    const local: VersionedRecord = {
      version: localRow.version,
      updated_at: localRow.updated_at,
    };
    const remote: VersionedRecord = {
      version: (record.version as number) ?? 1,
      updated_at: (record.updated_at as string) ?? "",
      data: record,
    };

    const merge = mergeByVersion(local, remote);

    if (merge.winner === "remote") {
      const columns = Object.keys(record).filter((column) => column !== "id");
      const sets = columns.map((column) => `${column} = ?`).join(", ");
      await db.runAsync(`UPDATE ${table} SET ${sets} WHERE id = ?`, [
        ...columns.map((column) => record[column] as string | number | null),
        change.entity_id,
      ]);
      applied++;
    } else {
      conflicts++;
    }
  }

  return { applied, conflicts };
}

export async function syncWithBff(
  client: ApiClient,
  lastSyncAt?: string
): Promise<{ pushed: number; pulled: number; conflicts: number; failed: number }> {
  const pushResult = await processPendingQueue(async (item) => {
    const result = await pushToBff(client, [queueItemToMutation(item)]);
    const accepted = result.accepted.some((acceptedItem) => acceptedItem.id === item.id);
    return { success: accepted && result.conflicts.length === 0 };
  });

  const pullResult = await pullFromBff(client, lastSyncAt);
  const applyResult = await applyRemoteChanges(pullResult.changes);

  return {
    pushed: pushResult.synced,
    pulled: applyResult.applied,
    conflicts: applyResult.conflicts,
    failed: pushResult.failed,
  };
}
