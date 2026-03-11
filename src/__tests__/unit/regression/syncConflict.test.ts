import {
  mergeByVersion,
  detectConflict,
  addToQueue,
  VersionedRecord,
} from "../../../features/sync/domain/syncQueue";

/**
 * Regression tests: CLAUDE.md Section 11.4
 * Sync offline/online with reconciliation.
 * Section 6.6 Release 1: conflict on two devices simultaneously.
 */

describe("Regression: sync conflict resolution", () => {
  it("should detect conflict when both local and remote modified since base", () => {
    const base = { version: 1 };
    const local = { version: 2, updated_at: "2026-03-10T10:00:00.000Z" };
    const remote = { version: 2, updated_at: "2026-03-10T10:05:00.000Z" };

    expect(detectConflict(local, remote, base)).toBe(true);
  });

  it("should not detect conflict when only local modified", () => {
    const base = { version: 1 };
    const local = { version: 2, updated_at: "2026-03-10T10:00:00.000Z" };
    const remote = { version: 1, updated_at: "2026-03-09T10:00:00.000Z" };

    expect(detectConflict(local, remote, base)).toBe(false);
  });

  it("should not detect conflict when only remote modified", () => {
    const base = { version: 1 };
    const local = { version: 1, updated_at: "2026-03-09T10:00:00.000Z" };
    const remote = { version: 2, updated_at: "2026-03-10T10:00:00.000Z" };

    expect(detectConflict(local, remote, base)).toBe(false);
  });

  it("should resolve conflict: higher version wins", () => {
    const local: VersionedRecord = {
      version: 3,
      updated_at: "2026-03-10T10:00:00.000Z",
      data: { name: "Local edit" },
    };
    const remote: VersionedRecord = {
      version: 2,
      updated_at: "2026-03-10T11:00:00.000Z",
      data: { name: "Remote edit" },
    };

    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("local");
    expect(result.data).toEqual({ name: "Local edit" });
  });

  it("should resolve conflict: same version, later timestamp wins", () => {
    const local: VersionedRecord = {
      version: 2,
      updated_at: "2026-03-10T10:00:00.000Z",
      data: { name: "Local" },
    };
    const remote: VersionedRecord = {
      version: 2,
      updated_at: "2026-03-10T09:00:00.000Z",
      data: { name: "Remote" },
    };

    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("local");
  });

  it("should resolve conflict: same version and time, server (remote) wins", () => {
    const local: VersionedRecord = {
      version: 2,
      updated_at: "2026-03-10T10:00:00.000Z",
      data: { name: "Local" },
    };
    const remote: VersionedRecord = {
      version: 2,
      updated_at: "2026-03-10T10:00:00.000Z",
      data: { name: "Remote" },
    };

    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("remote");
    expect(result.data).toEqual({ name: "Remote" });
  });

  it("should create queue item for offline mutations", () => {
    const item = addToQueue("transactions", "tx-1", "update", { name: "Updated" });
    expect(item.status).toBe("pending");
    expect(item.retry_count).toBe(0);
    expect(item.entity_type).toBe("transactions");
    expect(item.operation).toBe("update");
  });

  it("should handle rapid sequential edits (last write wins by version)", () => {
    const edit1: VersionedRecord = {
      version: 2,
      updated_at: "2026-03-10T10:00:00.000Z",
      data: { amount: 100 },
    };
    const edit2: VersionedRecord = {
      version: 3,
      updated_at: "2026-03-10T10:00:01.000Z",
      data: { amount: 200 },
    };
    const edit3: VersionedRecord = {
      version: 4,
      updated_at: "2026-03-10T10:00:02.000Z",
      data: { amount: 300 },
    };

    // Simulate: device A has edit1, device B has edit3
    const result = mergeByVersion(edit1, edit3);
    expect(result.winner).toBe("remote");
    expect(result.data).toEqual({ amount: 300 });

    // Then device B syncs with server that had edit2
    const result2 = mergeByVersion(edit2, edit3);
    expect(result2.winner).toBe("remote");
    expect(result2.data).toEqual({ amount: 300 });
  });
});
