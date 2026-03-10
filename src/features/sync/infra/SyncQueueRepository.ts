import { getDatabase } from "../../../shared/infra/database/database";
import { SyncQueueItem, SyncStatus } from "../domain/syncQueue";

interface SyncQueueRow {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload: string | null;
  status: string;
  retry_count: number;
  created_at: string;
}

function mapRow(row: SyncQueueRow): SyncQueueItem {
  return {
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    operation: row.operation as SyncQueueItem["operation"],
    payload: row.payload ? JSON.parse(row.payload) : null,
    status: row.status as SyncStatus,
    retry_count: row.retry_count,
    created_at: row.created_at,
  };
}

export class SyncQueueRepository {
  async enqueue(item: SyncQueueItem): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, status, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.entity_type,
        item.entity_id,
        item.operation,
        item.payload ? JSON.stringify(item.payload) : null,
        item.status,
        item.retry_count,
        item.created_at,
      ]
    );
  }

  async getPending(limit: number = 50): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SyncQueueRow>(
      "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT ?",
      [limit]
    );
    return rows.map(mapRow);
  }

  async updateStatus(id: string, status: SyncStatus): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE sync_queue SET status = ? WHERE id = ?", [status, id]);
  }

  async incrementRetry(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "UPDATE sync_queue SET retry_count = retry_count + 1, status = 'pending' WHERE id = ?",
      [id]
    );
  }

  async removeSynced(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sync_queue WHERE status = 'synced'");
  }

  async count(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM sync_queue WHERE status = 'pending'"
    );
    return row?.cnt ?? 0;
  }
}
