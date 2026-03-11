import { useSyncStore } from "../../../../features/sync/presentation/useSyncStore";

jest.mock("../../../../shared/infra/supabase/client", () => ({
  isSupabaseConfigured: jest.fn(() => false),
  getSupabaseClient: jest.fn(() => null),
}));

jest.mock("../../../../features/sync/application/syncService", () => ({
  getPendingCount: jest.fn().mockResolvedValue(3),
}));

jest.mock("../../../../features/sync/infra/SupabaseSync", () => ({
  fullSync: jest.fn().mockResolvedValue({ pushed: 0, pulled: 0, conflicts: 0, failed: 0 }),
}));

describe("useSyncStore", () => {
  beforeEach(() => {
    useSyncStore.setState({
      isSyncing: false,
      lastSyncAt: null,
      pendingCount: 0,
      lastResult: null,
      error: null,
      isConfigured: false,
    });
  });

  it("should initialize with pending count and configured status", async () => {
    await useSyncStore.getState().initialize();

    const state = useSyncStore.getState();
    expect(state.pendingCount).toBe(3);
    expect(state.isConfigured).toBe(false);
  });

  it("should set error when syncing without configuration", async () => {
    await useSyncStore.getState().sync("user1");

    const state = useSyncStore.getState();
    expect(state.error).toBe("Supabase não configurado");
    expect(state.isSyncing).toBe(false);
  });

  it("should refresh pending count", async () => {
    await useSyncStore.getState().refreshPendingCount();

    const state = useSyncStore.getState();
    expect(state.pendingCount).toBe(3);
  });

  it("should not start sync when already syncing", async () => {
    useSyncStore.setState({ isSyncing: true });

    const { isSupabaseConfigured } = require("../../../../shared/infra/supabase/client");
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);

    await useSyncStore.getState().sync("user1");

    // Should still be syncing (didn't change state)
    expect(useSyncStore.getState().isSyncing).toBe(true);
  });
});
