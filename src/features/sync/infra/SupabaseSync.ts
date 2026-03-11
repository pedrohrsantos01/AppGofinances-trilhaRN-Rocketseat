import { getSupabaseClient, isSupabaseConfigured } from "../../../shared/infra/supabase/client";
import { SyncQueueItem, mergeByVersion, VersionedRecord } from "../domain/syncQueue";

import { getDatabase } from "../../../shared/infra/database/database";

const ENTITY_TABLES: Record<string, string> = {
  transactions: "transactions",
  accounts: "accounts",
  credit_cards: "credit_cards",
  invoices: "invoices",
  budgets: "budgets",
  reminders: "reminders",
  goals: "goals",
};

export async function pushToSupabase(
  item: SyncQueueItem
): Promise<{ success: boolean; remoteData?: Record<string, unknown> }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false };

  const table = ENTITY_TABLES[item.entity_type];
  if (!table) return { success: false };

  try {
    if (item.operation === "insert" && item.payload) {
      const { error } = await supabase.from(table).upsert(item.payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true };
    }

    if (item.operation === "update" && item.payload) {
      const { data: remote } = await supabase
        .from(table)
        .select("version, updated_at")
        .eq("id", item.entity_id)
        .single();

      if (remote) {
        const local: VersionedRecord = {
          version: (item.payload.version as number) ?? 1,
          updated_at: (item.payload.updated_at as string) ?? new Date().toISOString(),
          data: item.payload,
        };
        const remoteRecord: VersionedRecord = {
          version: remote.version,
          updated_at: remote.updated_at,
        };
        const merge = mergeByVersion(local, remoteRecord);

        if (merge.winner === "remote") {
          return { success: true, remoteData: remote };
        }
      }

      const { error } = await supabase.from(table).upsert(item.payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true };
    }

    if (item.operation === "delete") {
      const { error } = await supabase.from(table).delete().eq("id", item.entity_id);
      if (error) throw error;
      return { success: true };
    }

    return { success: false };
  } catch {
    return { success: false };
  }
}

export async function pullFromSupabase(
  entityType: string,
  userId: string,
  lastSyncAt?: string
): Promise<Record<string, unknown>[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const table = ENTITY_TABLES[entityType];
  if (!table) return [];

  try {
    let query = supabase.from(table).select("*").eq("user_id", userId);

    if (lastSyncAt) {
      query = query.gt("updated_at", lastSyncAt);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function applyRemoteChanges(
  entityType: string,
  remoteRecords: Record<string, unknown>[]
): Promise<{ applied: number; conflicts: number }> {
  const db = await getDatabase();
  const table = ENTITY_TABLES[entityType];
  if (!table) return { applied: 0, conflicts: 0 };

  let applied = 0;
  let conflicts = 0;

  for (const record of remoteRecords) {
    const id = record.id as string;
    const localRow = await db.getFirstAsync<{ version: number; updated_at: string }>(
      `SELECT version, updated_at FROM ${table} WHERE id = ?`,
      [id]
    );

    if (!localRow) {
      const columns = Object.keys(record);
      const placeholders = columns.map(() => "?").join(", ");
      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
        columns.map((c) => record[c] as string | number | null)
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
      const columns = Object.keys(record).filter((c) => c !== "id");
      const sets = columns.map((c) => `${c} = ?`).join(", ");
      await db.runAsync(`UPDATE ${table} SET ${sets} WHERE id = ?`, [
        ...columns.map((c) => record[c] as string | number | null),
        id,
      ]);
      applied++;
    } else {
      conflicts++;
    }
  }

  return { applied, conflicts };
}

export async function fullSync(
  userId: string,
  lastSyncAt?: string
): Promise<{ pushed: number; pulled: number; conflicts: number; failed: number }> {
  if (!isSupabaseConfigured()) {
    return { pushed: 0, pulled: 0, conflicts: 0, failed: 0 };
  }

  const { processPendingQueue } = await import("../application/syncService");

  const pushResult = await processPendingQueue(pushToSupabase);

  let totalPulled = 0;
  let totalConflicts = 0;

  for (const entityType of Object.keys(ENTITY_TABLES)) {
    const remoteRecords = await pullFromSupabase(entityType, userId, lastSyncAt);
    const { applied, conflicts } = await applyRemoteChanges(entityType, remoteRecords);
    totalPulled += applied;
    totalConflicts += conflicts;
  }

  return {
    pushed: pushResult.synced,
    pulled: totalPulled,
    conflicts: totalConflicts,
    failed: pushResult.failed,
  };
}
