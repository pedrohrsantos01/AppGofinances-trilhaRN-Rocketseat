import {
  addToQueue,
  mergeByVersion,
  detectConflict,
} from "../../../../features/sync/domain/syncQueue";

describe("addToQueue", () => {
  it("should create a queue item for insert", () => {
    const item = addToQueue("transactions", "tx-1", "insert", {
      id: "tx-1",
      name: "Test",
    });
    expect(item.entity_type).toBe("transactions");
    expect(item.entity_id).toBe("tx-1");
    expect(item.operation).toBe("insert");
    expect(item.status).toBe("pending");
    expect(item.payload).toEqual({ id: "tx-1", name: "Test" });
  });

  it("should create a queue item for update", () => {
    const item = addToQueue("transactions", "tx-1", "update", {
      id: "tx-1",
      name: "Updated",
    });
    expect(item.operation).toBe("update");
  });

  it("should create a queue item for delete", () => {
    const item = addToQueue("transactions", "tx-1", "delete", null);
    expect(item.operation).toBe("delete");
    expect(item.payload).toBeNull();
  });

  it("should assign unique id and timestamp", () => {
    const a = addToQueue("transactions", "tx-1", "insert", {});
    const b = addToQueue("transactions", "tx-2", "insert", {});
    expect(a.id).not.toBe(b.id);
    expect(a.created_at).toBeDefined();
  });
});

describe("mergeByVersion", () => {
  it("should accept remote when remote version is higher", () => {
    const local = { version: 1, updated_at: "2025-03-10T10:00:00Z", data: { name: "Local" } };
    const remote = { version: 2, updated_at: "2025-03-10T11:00:00Z", data: { name: "Remote" } };
    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("remote");
    expect(result.data).toEqual({ name: "Remote" });
  });

  it("should keep local when local version is higher", () => {
    const local = { version: 3, updated_at: "2025-03-10T12:00:00Z", data: { name: "Local" } };
    const remote = { version: 2, updated_at: "2025-03-10T11:00:00Z", data: { name: "Remote" } };
    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("local");
    expect(result.data).toEqual({ name: "Local" });
  });

  it("should use updated_at as tiebreaker when versions equal", () => {
    const local = { version: 2, updated_at: "2025-03-10T12:00:00Z", data: { name: "Local" } };
    const remote = { version: 2, updated_at: "2025-03-10T11:00:00Z", data: { name: "Remote" } };
    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("local");
  });

  it("should prefer remote on exact tie (server wins)", () => {
    const local = { version: 2, updated_at: "2025-03-10T12:00:00Z", data: { name: "Local" } };
    const remote = { version: 2, updated_at: "2025-03-10T12:00:00Z", data: { name: "Remote" } };
    const result = mergeByVersion(local, remote);
    expect(result.winner).toBe("remote");
  });
});

describe("detectConflict", () => {
  it("should detect conflict when both modified", () => {
    const local = { version: 2, updated_at: "2025-03-10T12:00:00Z" };
    const remote = { version: 2, updated_at: "2025-03-10T13:00:00Z" };
    const base = { version: 1 };
    expect(detectConflict(local, remote, base)).toBe(true);
  });

  it("should not detect conflict when only one modified", () => {
    const local = { version: 2, updated_at: "2025-03-10T12:00:00Z" };
    const remote = { version: 1, updated_at: "2025-03-10T10:00:00Z" };
    const base = { version: 1 };
    expect(detectConflict(local, remote, base)).toBe(false);
  });

  it("should not detect conflict when neither modified", () => {
    const local = { version: 1, updated_at: "2025-03-10T10:00:00Z" };
    const remote = { version: 1, updated_at: "2025-03-10T10:00:00Z" };
    const base = { version: 1 };
    expect(detectConflict(local, remote, base)).toBe(false);
  });
});
