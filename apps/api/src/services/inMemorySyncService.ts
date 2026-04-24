import {
  AuthenticatedUser,
  SyncMutation,
  SyncPullResult,
  SyncPushResult,
  SyncService,
} from "../types";

export class InMemorySyncService implements SyncService {
  private readonly acceptedKeys = new Map<string, number>();

  async push(_user: AuthenticatedUser, mutations: SyncMutation[]): Promise<SyncPushResult> {
    return {
      accepted: mutations.map((mutation) => {
        const previousVersion = this.acceptedKeys.get(mutation.idempotency_key) ?? 0;
        const serverVersion = previousVersion || 1;
        this.acceptedKeys.set(mutation.idempotency_key, serverVersion);

        return {
          id: mutation.id,
          entity_id: mutation.entity_id,
          server_version: serverVersion,
        };
      }),
      conflicts: [],
    };
  }

  async pull(_user: AuthenticatedUser, since?: string): Promise<SyncPullResult> {
    return {
      changes: [],
      cursor: since ?? new Date(0).toISOString(),
    };
  }
}
