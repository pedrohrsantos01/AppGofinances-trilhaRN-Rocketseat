import { useSyncStore } from "../../../../features/sync/presentation/useSyncStore";

const mockApiClient = { request: jest.fn() };

jest.mock("../../../../shared/infra/http/createApiClient", () => ({
  isApiConfigured: jest.fn(() => false),
  createApiClient: jest.fn(() => mockApiClient),
}));

jest.mock("../../../../features/sync/application/syncService", () => ({
  getPendingCount: jest.fn().mockResolvedValue(3),
}));

jest.mock("../../../../features/sync/infra/BffSyncGateway", () => ({
  syncWithBff: jest.fn().mockResolvedValue({ pushed: 1, pulled: 0, conflicts: 0, failed: 0 }),
}));

describe("useSyncStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(state.error).toBe("API nao configurada");
    expect(state.isSyncing).toBe(false);
  });

  it("should refresh pending count", async () => {
    await useSyncStore.getState().refreshPendingCount();

    const state = useSyncStore.getState();
    expect(state.pendingCount).toBe(3);
  });

  it("should not start sync when already syncing", async () => {
    useSyncStore.setState({ isSyncing: true });

    const { isApiConfigured } = require("../../../../shared/infra/http/createApiClient");
    (isApiConfigured as jest.Mock).mockReturnValue(true);

    await useSyncStore.getState().sync("user1");

    expect(useSyncStore.getState().isSyncing).toBe(true);
  });

  it("should sync through the BFF gateway when API is configured", async () => {
    const { isApiConfigured } = require("../../../../shared/infra/http/createApiClient");
    const { syncWithBff } = require("../../../../features/sync/infra/BffSyncGateway");
    (isApiConfigured as jest.Mock).mockReturnValue(true);

    await useSyncStore.getState().sync("user1");

    expect(syncWithBff).toHaveBeenCalledWith(mockApiClient, undefined);
    expect(useSyncStore.getState().lastResult).toEqual({
      pushed: 1,
      pulled: 0,
      conflicts: 0,
      failed: 0,
    });
  });
});
