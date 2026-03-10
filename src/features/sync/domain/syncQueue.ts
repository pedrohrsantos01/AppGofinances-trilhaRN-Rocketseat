import uuid from "react-native-uuid";

export type SyncOperation = "insert" | "update" | "delete";
export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface SyncQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: SyncOperation;
  payload: Record<string, unknown> | null;
  status: SyncStatus;
  retry_count: number;
  created_at: string;
}

export interface VersionedRecord {
  version: number;
  updated_at: string;
  data?: Record<string, unknown>;
}

export interface MergeResult {
  winner: "local" | "remote";
  data: Record<string, unknown>;
}

export function addToQueue(
  entityType: string,
  entityId: string,
  operation: SyncOperation,
  payload: Record<string, unknown> | null
): SyncQueueItem {
  return {
    id: String(uuid.v4()),
    entity_type: entityType,
    entity_id: entityId,
    operation,
    payload,
    status: "pending",
    retry_count: 0,
    created_at: new Date().toISOString(),
  };
}

export function mergeByVersion(local: VersionedRecord, remote: VersionedRecord): MergeResult {
  if (remote.version > local.version) {
    return { winner: "remote", data: remote.data ?? {} };
  }
  if (local.version > remote.version) {
    return { winner: "local", data: local.data ?? {} };
  }

  // Same version — use updated_at as tiebreaker
  const localTime = new Date(local.updated_at).getTime();
  const remoteTime = new Date(remote.updated_at).getTime();

  if (localTime > remoteTime) {
    return { winner: "local", data: local.data ?? {} };
  }

  // Remote wins on exact tie (server authority)
  return { winner: "remote", data: remote.data ?? {} };
}

export function detectConflict(
  local: { version: number; updated_at: string },
  remote: { version: number; updated_at: string },
  base: { version: number }
): boolean {
  const localModified = local.version > base.version;
  const remoteModified = remote.version > base.version;
  return localModified && remoteModified;
}
