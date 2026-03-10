import { SyncQueueRepository } from "../infra/SyncQueueRepository";
import { addToQueue, SyncQueueItem } from "../domain/syncQueue";

const syncQueueRepo = new SyncQueueRepository();

export async function enqueueChange(
  entityType: string,
  entityId: string,
  operation: "insert" | "update" | "delete",
  payload: Record<string, unknown> | null
): Promise<void> {
  const item = addToQueue(entityType, entityId, operation, payload);
  await syncQueueRepo.enqueue(item);
}

export async function getPendingCount(): Promise<number> {
  return syncQueueRepo.count();
}

export async function processPendingQueue(
  syncFn: (
    item: SyncQueueItem
  ) => Promise<{ success: boolean; remoteData?: Record<string, unknown> }>
): Promise<{ synced: number; failed: number }> {
  const pending = await syncQueueRepo.getPending();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    await syncQueueRepo.updateStatus(item.id, "syncing");

    const result = await syncFn(item);

    if (result.success) {
      await syncQueueRepo.updateStatus(item.id, "synced");
      synced++;
    } else {
      await syncQueueRepo.incrementRetry(item.id);
      failed++;
    }
  }

  await syncQueueRepo.removeSynced();
  return { synced, failed };
}
