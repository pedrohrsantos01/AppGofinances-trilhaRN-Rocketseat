import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  applyRemoteChanges,
  pullFromBff,
  pushToBff,
  queueItemToMutation,
  syncWithBff,
  SyncMutation,
} from "../../../../features/sync/infra/BffSyncGateway";
import { ApiClient } from "../../../../shared/infra/http/ApiClient";
import { SyncQueueItem } from "../../../../features/sync/domain/syncQueue";
import { DEVICE_ID_KEY, resetDeviceIdCache } from "../../../../features/sync/infra/deviceId";

const mockGetFirstAsync = jest.fn();
const mockRunAsync = jest.fn();
const mockProcessPendingQueue = jest.fn();

jest.mock("../../../../shared/infra/database/database", () => ({
  getDatabase: jest.fn(async () => ({
    getFirstAsync: mockGetFirstAsync,
    runAsync: mockRunAsync,
  })),
}));

jest.mock("../../../../features/sync/application/syncService", () => ({
  processPendingQueue: (...args: unknown[]) => mockProcessPendingQueue(...args),
}));

describe("BffSyncGateway", () => {
  beforeEach(() => {
    mockGetFirstAsync.mockReset();
    mockRunAsync.mockReset();
    mockProcessPendingQueue.mockReset();
  });

  it("builds mutations with the persisted device id, not the local placeholder", async () => {
    resetDeviceIdCache();
    await AsyncStorage.clear();
    await AsyncStorage.setItem(DEVICE_ID_KEY, "device-abc");

    const item: SyncQueueItem = {
      id: "m1",
      entity_type: "transactions",
      entity_id: "tx1",
      operation: "insert",
      payload: { id: "tx1" },
      status: "pending",
      retry_count: 0,
      created_at: "2026-04-24T12:00:00.000Z",
    };

    const mutation = await queueItemToMutation(item);

    expect(mutation.device_id).toBe("device-abc");
    expect(mutation.idempotency_key).toBe("device-abc:m1");
  });

  it("pushes mutation batches to the BFF sync endpoint", async () => {
    const request = jest.fn().mockResolvedValue({ accepted: [], conflicts: [] });
    const client = { request } as unknown as ApiClient;
    const mutations: SyncMutation[] = [
      {
        id: "m1",
        entity_type: "transactions",
        entity_id: "tx1",
        operation: "insert",
        payload: { id: "tx1" },
        idempotency_key: "device-1:m1",
        device_id: "device-1",
        created_at: "2026-04-24T12:00:00.000Z",
      },
    ];

    await pushToBff(client, mutations);

    expect(request).toHaveBeenCalledWith("/v1/sync/push", {
      method: "POST",
      body: { mutations },
    });
  });

  it("pulls remote changes using the cursor when provided", async () => {
    const request = jest.fn().mockResolvedValue({ changes: [], cursor: "next" });
    const client = { request } as unknown as ApiClient;

    const result = await pullFromBff(client, "2026-04-24T12:00:00.000Z");

    expect(request).toHaveBeenCalledWith("/v1/sync/pull?since=2026-04-24T12%3A00%3A00.000Z");
    expect(result.cursor).toBe("next");
  });

  it("applies pulled remote changes to the local SQLite tables", async () => {
    mockGetFirstAsync.mockResolvedValue(null);

    const result = await applyRemoteChanges([
      {
        entity_type: "transactions",
        entity_id: "tx1",
        payload: {
          amount_cents: 1200,
          name: "Mercado",
          server_version: 4,
          deleted_at: null,
        },
        server_version: 4,
        updated_at: "2026-04-24T12:00:00.000Z",
        deleted_at: null,
      },
    ]);

    expect(result).toEqual({ applied: 1, conflicts: 0 });
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining("INSERT OR REPLACE INTO transactions"),
      expect.arrayContaining(["tx1", "2026-04-24T12:00:00.000Z", 4])
    );
  });

  it("applies remote tombstones as local deletes", async () => {
    const result = await applyRemoteChanges([
      {
        entity_type: "transactions",
        entity_id: "tx1",
        payload: null,
        server_version: 5,
        updated_at: "2026-04-24T12:00:00.000Z",
        deleted_at: "2026-04-24T12:01:00.000Z",
      },
    ]);

    expect(result).toEqual({ applied: 1, conflicts: 0 });
    expect(mockRunAsync).toHaveBeenCalledWith("DELETE FROM transactions WHERE id = ?", ["tx1"]);
  });

  it("syncs pending queue mutations and applies pulled changes", async () => {
    const queueItem: SyncQueueItem = {
      id: "m1",
      entity_type: "transactions",
      entity_id: "tx1",
      operation: "insert",
      payload: { id: "tx1", name: "Mercado" },
      status: "pending",
      retry_count: 0,
      created_at: "2026-04-24T12:00:00.000Z",
    };
    mockProcessPendingQueue.mockImplementation(
      async (syncFn: (item: SyncQueueItem) => Promise<{ success: boolean }>) => {
        const result = await syncFn(queueItem);
        return { synced: result.success ? 1 : 0, failed: result.success ? 0 : 1 };
      }
    );
    mockGetFirstAsync.mockResolvedValue(null);

    const request = jest.fn((path: string) => {
      if (path === "/v1/sync/push") {
        return Promise.resolve({
          accepted: [{ id: "m1", entity_id: "tx1", server_version: 1 }],
          conflicts: [],
        });
      }

      return Promise.resolve({
        changes: [
          {
            entity_type: "transactions",
            entity_id: "tx1",
            payload: { id: "tx1", name: "Mercado" },
            server_version: 1,
            updated_at: "2026-04-24T12:00:00.000Z",
            deleted_at: null,
          },
        ],
        cursor: "2026-04-24T12:00:00.000Z",
      });
    });

    const result = await syncWithBff({ request } as unknown as ApiClient);

    expect(result).toEqual({ pushed: 1, pulled: 1, conflicts: 0, failed: 0 });
  });
});
