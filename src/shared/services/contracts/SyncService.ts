export type SyncOperation = "create" | "update" | "delete";
export type SyncStatus = "pending" | "syncing" | "synced" | "conflict" | "error";

export interface SyncQueueItem {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: SyncOperation;
  payload: string;
  status: SyncStatus;
  created_at: string;
  retries: number;
  last_error?: string;
}

export interface SyncResult {
  synced: number;
  conflicts: number;
  errors: number;
}

export interface SyncService {
  enqueue(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    payload: unknown
  ): Promise<void>;
  processQueue(): Promise<SyncResult>;
  getPendingCount(): Promise<number>;
  resolveConflict(queueItemId: string, resolution: "local" | "remote"): Promise<void>;
}
