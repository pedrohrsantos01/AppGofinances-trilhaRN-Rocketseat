import { pushToSupabase, pullFromSupabase } from "../../../../features/sync/infra/SupabaseSync";
import { SyncQueueItem } from "../../../../features/sync/domain/syncQueue";
import { getSupabaseClient } from "../../../../shared/infra/supabase/client";

jest.mock("../../../../shared/infra/supabase/client", () => ({
  isSupabaseConfigured: jest.fn(() => true),
  getSupabaseClient: jest.fn(),
}));

jest.mock("../../../../shared/infra/database/database", () => ({
  getDatabase: jest.fn().mockResolvedValue({
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
}));

describe("SupabaseSync", () => {
  const mockUpsert = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockDelete = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null }),
  });
  const mockSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  });
  const mockSelectAll = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      gt: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  });

  const mockClient = {
    from: jest.fn((table: string) => ({
      upsert: mockUpsert,
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          gt: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  });

  describe("pushToSupabase", () => {
    it("should upsert on insert operation", async () => {
      const item: SyncQueueItem = {
        id: "q1",
        entity_type: "transactions",
        entity_id: "tx1",
        operation: "insert",
        payload: { id: "tx1", name: "Test", amount_cents: 1000 },
        status: "pending",
        retry_count: 0,
        created_at: new Date().toISOString(),
      };

      const result = await pushToSupabase(item);
      expect(result.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith("transactions");
    });

    it("should delete on delete operation", async () => {
      const item: SyncQueueItem = {
        id: "q2",
        entity_type: "accounts",
        entity_id: "acc1",
        operation: "delete",
        payload: null,
        status: "pending",
        retry_count: 0,
        created_at: new Date().toISOString(),
      };

      const result = await pushToSupabase(item);
      expect(result.success).toBe(true);
      expect(mockClient.from).toHaveBeenCalledWith("accounts");
    });

    it("should return false when supabase is not configured", async () => {
      (getSupabaseClient as jest.Mock).mockReturnValue(null);

      const item: SyncQueueItem = {
        id: "q3",
        entity_type: "transactions",
        entity_id: "tx1",
        operation: "insert",
        payload: { id: "tx1" },
        status: "pending",
        retry_count: 0,
        created_at: new Date().toISOString(),
      };

      const result = await pushToSupabase(item);
      expect(result.success).toBe(false);
    });

    it("should return false for unknown entity type", async () => {
      const item: SyncQueueItem = {
        id: "q4",
        entity_type: "unknown_table",
        entity_id: "x1",
        operation: "insert",
        payload: { id: "x1" },
        status: "pending",
        retry_count: 0,
        created_at: new Date().toISOString(),
      };

      const result = await pushToSupabase(item);
      expect(result.success).toBe(false);
    });
  });

  describe("pullFromSupabase", () => {
    it("should return empty array when supabase is not configured", async () => {
      (getSupabaseClient as jest.Mock).mockReturnValue(null);

      const result = await pullFromSupabase("transactions", "user1");
      expect(result).toEqual([]);
    });

    it("should query with user_id filter", async () => {
      const mockEq = jest.fn().mockReturnValue({
        gt: jest.fn().mockResolvedValue({ data: [{ id: "tx1" }], error: null }),
      });
      const mockSelectFn = jest.fn().mockReturnValue({ eq: mockEq });

      (getSupabaseClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => ({ select: mockSelectFn })),
      });

      const result = await pullFromSupabase("transactions", "user1", "2024-01-01");
      expect(result).toEqual([{ id: "tx1" }]);
    });

    it("should return empty for unknown entity type", async () => {
      const result = await pullFromSupabase("unknown", "user1");
      expect(result).toEqual([]);
    });
  });
});
