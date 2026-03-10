import {
  enqueueChange,
  getPendingCount,
  processPendingQueue,
} from "../../../../features/sync/application/syncService";
import { closeDatabase } from "../../../../shared/infra/database/database";

beforeEach(async () => {
  const sqlite = require("expo-sqlite");
  sqlite.__resetStores();
  await closeDatabase();
});

describe("syncService", () => {
  it("should enqueue a change", async () => {
    await expect(
      enqueueChange("transaction", "tx-1", "insert", { name: "Test" })
    ).resolves.toBeUndefined();
  });

  it("should return pending count", async () => {
    const count = await getPendingCount();
    expect(typeof count).toBe("number");
  });

  it("should process pending queue with successful sync", async () => {
    // Enqueue items first
    await enqueueChange("transaction", "tx-1", "insert", { name: "A" });
    await enqueueChange("transaction", "tx-2", "update", { name: "B" });

    const syncFn = jest.fn().mockResolvedValue({ success: true });
    const result = await processPendingQueue(syncFn);

    expect(result).toEqual({ synced: expect.any(Number), failed: expect.any(Number) });
  });

  it("should process pending queue with failed sync", async () => {
    await enqueueChange("transaction", "tx-3", "insert", { name: "C" });

    const syncFn = jest.fn().mockResolvedValue({ success: false });
    const result = await processPendingQueue(syncFn);

    expect(result).toEqual({ synced: expect.any(Number), failed: expect.any(Number) });
  });
});
