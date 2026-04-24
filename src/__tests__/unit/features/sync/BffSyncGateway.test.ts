import {
  applyRemoteChanges,
  pullFromBff,
  pushToBff,
  SyncMutation,
} from "../../../../features/sync/infra/BffSyncGateway";
import { ApiClient } from "../../../../shared/infra/http/ApiClient";

const mockGetFirstAsync = jest.fn();
const mockRunAsync = jest.fn();

jest.mock("../../../../shared/infra/database/database", () => ({
  getDatabase: jest.fn(async () => ({
    getFirstAsync: mockGetFirstAsync,
    runAsync: mockRunAsync,
  })),
}));

describe("BffSyncGateway", () => {
  beforeEach(() => {
    mockGetFirstAsync.mockReset();
    mockRunAsync.mockReset();
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
});
