import { AuthenticatedUser, SharedAccess, SharingService, ShareRole } from "../types";

export class InMemorySharingService implements SharingService {
  private shares = new Map<string, SharedAccess>();

  async listByOwner(user: AuthenticatedUser): Promise<SharedAccess[]> {
    return Array.from(this.shares.values()).filter((share) => share.owner_user_id === user.id);
  }

  async createInvite(
    user: AuthenticatedUser,
    input: { email: string; role: ShareRole }
  ): Promise<SharedAccess> {
    const now = new Date().toISOString();
    const share: SharedAccess = {
      id: `share-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      owner_user_id: user.id,
      shared_with_user_id: "",
      shared_with_email: input.email,
      role: input.role,
      status: "pending",
      created_at: now,
      updated_at: now,
      version: 1,
    };

    this.shares.set(share.id, share);
    return share;
  }

  async revoke(user: AuthenticatedUser, id: string): Promise<SharedAccess> {
    const current = this.shares.get(id);
    if (!current || current.owner_user_id !== user.id) {
      throw new Error("Share not found");
    }

    const revoked: SharedAccess = {
      ...current,
      status: "revoked",
      updated_at: new Date().toISOString(),
      version: current.version + 1,
    };
    this.shares.set(id, revoked);
    return revoked;
  }
}
